// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IOmniPayNotifier
 * @notice Interface for payment notification callbacks
 * @dev Implement this interface to receive payment event notifications
 */
interface IOmniPayNotifier {
    /**
     * @notice Callback for successful payment notifications
     * @param payer Address that initiated the payment
     * @param payee Address that received the payment
     * @param token Token address (address(0) for native ETH)
     * @param amount Payment amount
     * @param paymentRef Reference string for the payment
     */
    function notifyPaymentSuccess(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef
    ) external;

    /**
     * @notice Callback for failed payment notifications
     * @param payer Address that initiated the payment
     * @param payee Intended recipient of the payment
     * @param token Token address (address(0) for native ETH)
     * @param amount Payment amount
     * @param paymentRef Reference string for the payment
     * @param reason Failure reason description
     */
    function notifyPaymentFailure(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef,
        string calldata reason
    ) external;
}

/**
 * @title OmniPayCore
 * @notice Core payment processing contract supporting ETH and ERC20 tokens
 * @dev Implements secure payment processing with event logging and optional notifications
 * @custom:security-contact security@omnipay.example
 */
contract OmniPayCore is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /// @notice Structure representing a completed transaction
    struct Transaction {
        address payer;          // Address that initiated the payment
        address payee;          // Address that received the payment
        address token;          // Token address (address(0) for native ETH)
        uint256 amount;         // Payment amount
        uint256 timestamp;      // Block timestamp when transaction completed
        string paymentRef;      // Reference string for payment tracking
    }

    /// @notice Emitted when a payment is initiated
    event PaymentInitiated(
        address indexed payer,
        address indexed payee,
        address indexed token,
        uint256 amount,
        string paymentRef
    );

    /// @notice Emitted when a payment is successfully completed
    event PaymentCompleted(
        uint256 indexed txId,
        address indexed payer,
        address indexed payee,
        address token,
        uint256 amount,
        string paymentRef
    );

    /// @notice Emitted when a payment fails
    event PaymentFailed(
        address indexed payer,
        address indexed payee,
        address indexed token,
        uint256 amount,
        string paymentRef,
        string reason
    );

    /// @notice Emitted when the notifier address is updated
    event NotifierUpdated(address indexed oldNotifier, address indexed newNotifier);

    /// @notice Array storing all completed transactions
    Transaction[] public transactions;

    /// @notice Address of the notification contract (optional)
    address public notifier;

    /// @notice Maximum length for payment reference strings
    uint256 public constant MAX_PAYMENT_REF_LENGTH = 256;

    /**
     * @notice Contract constructor
     * @param _owner Initial owner of the contract
     * @param _notifier Initial notifier contract address (can be address(0))
     */
    constructor(address _owner, address _notifier) Ownable(_owner) {
        notifier = _notifier;
    }

    /**
     * @notice Updates the notifier contract address
     * @param _notifier New notifier address (address(0) to disable notifications)
     * @dev Only callable by contract owner
     */
    function setNotifier(address _notifier) external onlyOwner {
        address oldNotifier = notifier;
        notifier = _notifier;
        emit NotifierUpdated(oldNotifier, _notifier);
    }

    /**
     * @notice Process a payment in native ETH
     * @param payee Recipient address for the payment
     * @param paymentRef Reference string for payment tracking (max 256 chars)
     * @dev Requires msg.value > 0. Protected by reentrancy guard and pause mechanism
     */
    function payETH(address payable payee, string calldata paymentRef)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        require(payee != address(0), "OmniPay: Invalid payee address");
        require(msg.value > 0, "OmniPay: No ETH sent");
        require(bytes(paymentRef).length <= MAX_PAYMENT_REF_LENGTH, "OmniPay: Payment ref too long");

        emit PaymentInitiated(msg.sender, payee, address(0), msg.value, paymentRef);

        // Execute ETH transfer
        (bool success, ) = payee.call{value: msg.value}("");
        require(success, "OmniPay: ETH transfer failed");

        // Record transaction
        uint256 txId = _recordTransaction(
            msg.sender,
            payee,
            address(0),
            msg.value,
            paymentRef
        );

        emit PaymentCompleted(txId, msg.sender, payee, address(0), msg.value, paymentRef);

        // Attempt notification (best effort)
        _notifySuccess(msg.sender, payee, address(0), msg.value, paymentRef);
    }

    /**
     * @notice Process a payment in ERC20 tokens
     * @param token ERC20 token contract address
     * @param payee Recipient address for the payment
     * @param amount Token amount to transfer
     * @param paymentRef Reference string for payment tracking (max 256 chars)
     * @dev Requires prior token approval. Protected by reentrancy guard and pause mechanism
     */
    function payERC20(
        IERC20 token,
        address payee,
        uint256 amount,
        string calldata paymentRef
    ) external nonReentrant whenNotPaused {
        require(address(token) != address(0), "OmniPay: Invalid token address");
        require(payee != address(0), "OmniPay: Invalid payee address");
        require(amount > 0, "OmniPay: Amount must be greater than zero");
        require(bytes(paymentRef).length <= MAX_PAYMENT_REF_LENGTH, "OmniPay: Payment ref too long");

        emit PaymentInitiated(msg.sender, payee, address(token), amount, paymentRef);

        // Execute token transfer using SafeERC20
        token.safeTransferFrom(msg.sender, payee, amount);

        // Record transaction
        uint256 txId = _recordTransaction(
            msg.sender,
            payee,
            address(token),
            amount,
            paymentRef
        );

        emit PaymentCompleted(txId, msg.sender, payee, address(token), amount, paymentRef);

        // Attempt notification (best effort)
        _notifySuccess(msg.sender, payee, address(token), amount, paymentRef);
    }

    /**
     * @notice Returns the total number of recorded transactions
     * @return Total transaction count
     */
    function transactionCount() external view returns (uint256) {
        return transactions.length;
    }

    /**
     * @notice Retrieves a batch of transactions
     * @param startIndex Starting index (inclusive)
     * @param count Number of transactions to retrieve
     * @return Array of Transaction structs
     * @dev Reverts if indices are out of bounds
     */
    function getTransactions(uint256 startIndex, uint256 count)
        external
        view
        returns (Transaction[] memory)
    {
        require(startIndex < transactions.length, "OmniPay: Start index out of bounds");
        
        uint256 endIndex = startIndex + count;
        if (endIndex > transactions.length) {
            endIndex = transactions.length;
        }
        
        uint256 resultCount = endIndex - startIndex;
        Transaction[] memory result = new Transaction[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = transactions[startIndex + i];
        }
        
        return result;
    }

    /**
     * @notice Pauses all payment operations
     * @dev Only callable by contract owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resumes all payment operations
     * @dev Only callable by contract owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Internal function to record a completed transaction
     * @param payer Address that initiated the payment
     * @param payee Address that received the payment
     * @param token Token address (address(0) for ETH)
     * @param amount Payment amount
     * @param paymentRef Reference string for the payment
     * @return txId The ID of the recorded transaction
     */
    function _recordTransaction(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef
    ) private returns (uint256 txId) {
        transactions.push(
            Transaction({
                payer: payer,
                payee: payee,
                token: token,
                amount: amount,
                timestamp: block.timestamp,
                paymentRef: paymentRef
            })
        );
        return transactions.length - 1;
    }

    /**
     * @notice Internal function to send success notification
     * @param payer Address that initiated the payment
     * @param payee Address that received the payment
     * @param token Token address (address(0) for ETH)
     * @param amount Payment amount
     * @param paymentRef Reference string for the payment
     * @dev Best-effort notification - failures are silently ignored
     */
    function _notifySuccess(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef
    ) private {
        if (notifier != address(0)) {
            try IOmniPayNotifier(notifier).notifyPaymentSuccess(
                payer,
                payee,
                token,
                amount,
                paymentRef
            ) {} catch {
                // Notification failure does not affect payment completion
            }
        }
    }

    /**
     * @notice Internal function to send failure notification
     * @param payer Address that initiated the payment
     * @param payee Address that should have received the payment
     * @param token Token address (address(0) for ETH)
     * @param amount Payment amount
     * @param paymentRef Reference string for the payment
     * @param reason Failure reason
     * @dev Best-effort notification - failures are silently ignored
     */
    function _notifyFailure(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef,
        string calldata reason
    ) private {
        if (notifier != address(0)) {
            try IOmniPayNotifier(notifier).notifyPaymentFailure(
                payer,
                payee,
                token,
                amount,
                paymentRef,
                reason
            ) {} catch {
                // Notification failure does not affect payment processing
            }
        }
    }

    /**
     * @notice Prevents accidental ETH transfers to the contract
     * @dev Rejects all direct ETH transfers (use payETH function instead)
     */
    receive() external payable {
        revert("OmniPay: Use payETH function for payments");
    }
}