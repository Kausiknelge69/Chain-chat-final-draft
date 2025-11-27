// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainChain
 * @notice A serverless backend for secure messaging.
 * Stores metadata on-chain; encrypted content lives on IPFS.
 */
contract ChainChain {
    // A counter to give every message a unique ID
    uint256 public messageCount;

    // Define what a "Message" looks like in our database
    struct Message {
        uint256 id;
        address sender;
        address recipient;
        uint256 timestamp;
        string cid;        // IPFS Content ID (pointer to encrypted data)
        bytes signature;   // EIP-712 Signature (proof of origin)
    }

    // A mapping acts like a database index: User Address -> List of Messages
    mapping(address => Message[]) public userMessages;

    // Events let the frontend know when something happens instantly
    event MessageSent(
        uint256 indexed id,
        address indexed sender,
        address indexed recipient,
        uint256 timestamp,
        string cid
    );

    /**
     * @notice The main function to send a message.
     * @param _recipient Who gets the message.
     * @param _cid The IPFS hash of the encrypted JSON.
     * @param _signature The cryptographic signature verifying the sender.
     */
    function sendMessage(
        address _recipient,
        string memory _cid,
        bytes memory _signature
    ) public {
        require(_recipient != address(0), "Invalid recipient");
        require(bytes(_cid).length > 0, "CID cannot be empty");

        messageCount++;

        Message memory newMessage = Message({
            id: messageCount,
            sender: msg.sender,
            recipient: _recipient,
            timestamp: block.timestamp,
            cid: _cid,
            signature: _signature
        });

        // Store message in the recipient's inbox
        userMessages[_recipient].push(newMessage);

        // Emit an event so the frontend updates immediately
        emit MessageSent(
            messageCount,
            msg.sender,
            _recipient,
            block.timestamp,
            _cid
        );
    }

    /**
     * @notice Fetch all messages for a specific user.
     * @dev This is a "view" function, meaning it costs 0 gas to call.
     */
    function getMessagesForUser(address _user) public view returns (Message[] memory) {
        return userMessages[_user];
    }
}