// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Zainab_SupplyChain {
    address public owner;

    // Requirement: Implement roles
    enum Role { None, Manufacturer, Distributor, Retailer, Customer }
    enum Status { Manufactured, InTransit, Delivered, Sold }

    struct Product {
        uint256 id;
        string name;
        string description;
        address currentOwner;
        Status status;
        address[] history; // Audit Trail of owners
    }

    mapping(uint256 => Product) public products;
    mapping(address => Role) public userRoles;
    uint256 public productCount;

    // Modifier to restrict functions to specific roles
    modifier onlyRole(Role _role) {
        require(userRoles[msg.sender] == _role, "Not authorized for this role");
        _;
    }

    constructor() {
        owner = msg.sender;
        // The deployer is often the first manufacturer for testing
        userRoles[msg.sender] = Role.Manufacturer;
    }

    // Function to assign roles (Admin/Owner can do this)
    function assignRole(address _user, Role _role) public {
        require(msg.sender == owner, "Only contract owner can assign roles");
        userRoles[_user] = _role;
    }

    // Requirement: Register new products (Manufacturer only)
    function registerProduct(string memory _name, string memory _description) 
        public 
        onlyRole(Role.Manufacturer) 
    {
        productCount++;
        
        // Initialize an empty array for history
        address[] memory initialHistory;
        
        products[productCount] = Product({
            id: productCount,
            name: _name,
            description: _description,
            currentOwner: msg.sender,
            status: Status.Manufactured,
            history: initialHistory
        });
        
        products[productCount].history.push(msg.sender);
    }

    // Requirement: Transfer product ownership between roles
    function transferOwnership(uint256 _id, address _newOwner, Status _newStatus) public {
        Product storage p = products[_id];
        require(msg.sender == p.currentOwner, "Not the current owner");
        
        // ENFORCE SEQUENCE:
       if (p.status == Status.Manufactured) {
        require(_newStatus == Status.InTransit, "Must move to InTransit next");
    } else if (p.status == Status.InTransit) {
        require(_newStatus == Status.Delivered, "Must move to Delivered next");
    } else if (p.status == Status.Delivered) {
        require(_newStatus == Status.Sold, "Must move to Sold next");
    }
        p.currentOwner = _newOwner;
        p.status = _newStatus;
        p.history.push(_newOwner);
    }

    // Requirement: View product history (audit trail)
    function getHistory(uint256 _id) public view returns (address[] memory) {
        return products[_id].history;
    }

    // Helper to get full product details
    function getProduct(uint256 _id) public view returns (
        string memory name, 
        string memory desc, 
        address currentOwner, 
        Status status
    ) {
        Product storage p = products[_id];
        return (p.name, p.description, p.currentOwner, p.status);
    }
}