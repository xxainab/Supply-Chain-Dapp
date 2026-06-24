# 🔗 Supply Chain Management DApp

![Polygon](https://img.shields.io/badge/Network-Polygon%20Amoy-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Hardhat](https://img.shields.io/badge/Framework-Hardhat-F3DF29?style=for-the-badge&logo=hardhat&logoColor=black)
![Solidity](https://img.shields.io/badge/Smart%20Contract-Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)

A Decentralized Application (DApp) designed to ensure **transparency** and **traceability** in product movement. By utilizing a smart contract on the Polygon blockchain, this system provides a tamper-proof audit trail from the manufacturer all the way to the final consumer.

---

### ✨ Key Features

*   🔍 **Transparency:** All transactions and ownership transfers are publicly verifiable on Polygonscan.
*   🔐 **Role Security:** Strict role-based access control. Only authorized, current owners can transfer products to the next stage.
*   📜 **Traceability:** Maintains a complete, multi-step history for every unique Product ID, showing all wallet addresses that handled the item.

---

### 🌐 Network & Deployment

The smart contract was compiled and deployed using the Hardhat framework.

*   **Network:** Polygon Amoy Testnet
*   **Smart Contract Address:** `0x6A1b64a133928054eBd66fa86820Db5622278119`
*   **Transaction Hash:** `0x6e21dc4fba39583efa8b873d8ff34f1fa1490a847562633ed1524e29b93d014b`

---

### 👥 System Workflow & Roles

The supply chain enforces a strict linear transfer system. The frontend GUI dynamically updates based on the connected MetaMask wallet, ensuring secure role management.

| Role | Action / Responsibility | Product Status |
| :--- | :--- | :--- |
| 🏭 **1. Manufacturer** | Registers the new product on the blockchain. | `Manufactured` |
| 🚚 **2. Distributor** | Receives the product and transports it. | `In Transit` |
| 🏪 **3. Retailer** | Receives the product and prepares it for final sale. | `In Transit` |
| 👤 **4. Consumer** | The final owner. Can view the full 4-step audit trail. | `Sold` |

---

