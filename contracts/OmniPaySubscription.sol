// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IOmniPayNotifier
 * @notice Interface for payment notification callbacks
 */
interface IOmniPayNotifier {
    function notifyPaymentSuccess(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef
    ) external;

    function notifyPaymentFailure(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata paymentRef,
        string calldata reason
    ) external;

    function notifySubscriptionExecuted(
        uint256 subId,
        address subscriber,
        address merchant,
        address token,
        uint256 amount,
        uint256 nextPaymentDue
    ) external;

    function notifySubscriptionCancelled(uint256 subId, address subscriber, address merchant) external;
}

contract OmniPaySubscription is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Subscription {
        uint256 id;
        address subscriber;
        address merchant;
        address token; // address(0) for ETH
        uint256 amount;
        uint256 interval; // seconds
        uint256 nextPaymentDue;
        bool active;
    }

    event SubscriptionCreated(
        uint256 indexed id,
        address indexed subscriber,
        address indexed merchant,
        address token,
        uint256 amount,
        uint256 interval,
        uint256 nextPaymentDue
    );
    event SubscriptionExecuted(
        uint256 indexed id,
        address indexed subscriber,
        address indexed merchant,
        address token,
        uint256 amount,
        uint256 nextPaymentDue
    );
    event SubscriptionCancelled(uint256 indexed id, address indexed subscriber, address indexed merchant);
    
    event SubscriptionFailed(
        uint256 indexed id,
        address indexed subscriber,
        address indexed merchant,
        address token,
        uint256 amount,
        string reason
    );

    uint256 public nextId = 1;
    mapping(uint256 => Subscription) public subscriptions;
    address public notifier;

    constructor(address _notifier) Ownable(msg.sender) {
        notifier = _notifier;
    }

    function setNotifier(address _notifier) external onlyOwner {
        notifier = _notifier;
    }

    /// @notice Create a new subscription
    /// @param merchant Merchant to receive payments
    /// @param token ERC-20 token address or address(0) for ETH
    /// @param amount Amount per interval (ETH wei or token units)
    /// @param intervalSeconds Interval in seconds between payments
    function createSubscription(
        address merchant,
        address token,
        uint256 amount,
        uint256 intervalSeconds
    ) external returns (uint256 id) {
        require(merchant != address(0), "Invalid merchant");
        require(merchant != msg.sender, "Cannot subscribe to yourself");
        require(amount > 0, "Amount = 0");
        require(intervalSeconds >= 60, "Interval too short");
        require(intervalSeconds <= 365 days, "Interval too long");

        id = nextId++;
        subscriptions[id] = Subscription({
            id: id,
            subscriber: msg.sender,
            merchant: merchant,
            token: token,
            amount: amount,
            interval: intervalSeconds,
            nextPaymentDue: block.timestamp + intervalSeconds,
            active: true
        });

        emit SubscriptionCreated(id, msg.sender, merchant, token, amount, intervalSeconds, subscriptions[id].nextPaymentDue);
    }

    /// @notice Execute a due subscription payment
    /// @param id Subscription id
    function executeSubscription(uint256 id) external payable nonReentrant {
        require(id > 0 && id < nextId, "Invalid subscription ID");
        Subscription storage s = subscriptions[id];
        require(s.active, "Inactive");
        require(s.subscriber == msg.sender, "Only subscriber");
        require(block.timestamp >= s.nextPaymentDue, "Not due");

        (bool paymentSuccess, string memory failureReason) = _processPayment(s);

        if (paymentSuccess) {
            _onPaymentSuccess(s);
        } else {
            _onPaymentFailure(s, failureReason);
        }
    }

    function _processPayment(Subscription storage s) private returns (bool success, string memory reason) {
        if (s.token == address(0)) {
            return _processEthPayment(s);
        } else {
            return _processTokenPayment(s);
        }
    }

    function _processEthPayment(Subscription storage s) private returns (bool success, string memory reason) {
        if (msg.value != s.amount) {
            return (false, "Incorrect ETH amount");
        }
        (bool ok, ) = payable(s.merchant).call{value: s.amount}("");
        if (!ok) {
            return (false, "ETH transfer failed");
        }
        return (true, "");
    }

    function _processTokenPayment(Subscription storage s) private returns (bool success, string memory reason) {
        if (msg.value != 0) {
            return (false, "No ETH needed for token payment");
        }
        try IERC20(s.token).transferFrom(s.subscriber, s.merchant, s.amount) returns (bool ok) {
            if (!ok) {
                return (false, "Token transfer failed");
            }
            return (true, "");
        } catch Error(string memory err) {
            return (false, err);
        } catch {
            return (false, "Token transfer failed");
        }
    }

    function _onPaymentSuccess(Subscription storage s) private {
        s.nextPaymentDue = block.timestamp + s.interval;
        emit SubscriptionExecuted(s.id, s.subscriber, s.merchant, s.token, s.amount, s.nextPaymentDue);

        if (notifier != address(0)) {
            try IOmniPayNotifier(notifier).notifySubscriptionExecuted(
                s.id,
                s.subscriber,
                s.merchant,
                s.token,
                s.amount,
                s.nextPaymentDue
            ) {} catch {}
        }
    }

    function _onPaymentFailure(Subscription storage s, string memory reason) private {
        emit SubscriptionFailed(s.id, s.subscriber, s.merchant, s.token, s.amount, reason);

        if (notifier != address(0)) {
            try IOmniPayNotifier(notifier).notifyPaymentFailure(
                s.subscriber,
                s.merchant,
                s.token,
                s.amount,
                string(abi.encodePacked("Subscription ", s.id)),
                reason
            ) {} catch {}
        }
    }

    /// @notice Cancel an active subscription
    /// @param id Subscription id
    function cancelSubscription(uint256 id) external {
        require(id > 0 && id < nextId, "Invalid subscription ID");
        Subscription storage s = subscriptions[id];
        require(s.active, "Already inactive");
        require(s.subscriber == msg.sender || msg.sender == owner(), "Only subscriber or owner");
        s.active = false;
        emit SubscriptionCancelled(id, s.subscriber, s.merchant);

        if (notifier != address(0)) {
            try IOmniPayNotifier(notifier).notifySubscriptionCancelled(id, s.subscriber, s.merchant) {} catch {}
        }
    }

    /// @notice Get all subscriptions for a user (gas-optimized version)
    /// @param user Address of the user
    /// @return userSubscriptions Array of subscriptions for the user
    function getUserSubscriptions(address user) external view returns (Subscription[] memory userSubscriptions) {
        require(user != address(0), "Invalid user address");
        
        // Use a more gas-efficient approach for small datasets
        uint256 totalSubs = nextId - 1;
        if (totalSubs == 0) {
            return new Subscription[](0);
        }
        
        // For large datasets, consider implementing pagination
        require(totalSubs <= 1000, "Too many subscriptions, use pagination");
        
        // First, count how many subscriptions the user has
        uint256 count = 0;
        for (uint256 i = 1; i < nextId; i++) {
            if (subscriptions[i].subscriber == user) {
                unchecked { count++; }
            }
        }

        // Create array with the correct size
        userSubscriptions = new Subscription[](count);
        
        // Fill the array with user's subscriptions
        uint256 index = 0;
        for (uint256 i = 1; i < nextId && index < count; i++) {
            if (subscriptions[i].subscriber == user) {
                userSubscriptions[index] = subscriptions[i];
                unchecked { index++; }
            }
        }
    }

    /// @notice Get a specific subscription by ID
    /// @param id Subscription ID
    /// @return subscription The subscription details
    function getSubscription(uint256 id) external view returns (Subscription memory subscription) {
        require(id > 0 && id < nextId, "Invalid subscription ID");
        return subscriptions[id];
    }
}