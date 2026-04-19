import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './abi.json';

const CONTRACT_ADDRESS = "0x6A1b64a133928054eBd66fa86820Db562227B119";
const MANU_ADDR = "0x7920488b68380cb425acc18c36005d4ef98350aa".toLowerCase();

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // For the Pop-up

  // Form States
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr.toLowerCase());
      setContract(new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer));
    }
  };

  useEffect(() => {
    if (contract) loadAllProducts();
  }, [contract, account]);

  const loadAllProducts = async () => {
    let items = [];
    // Start from the first "clean" product ID. 
    // If your good products start at ID 4, change 'i = 1' to 'i = 4'
    for (let i = 4; i <= 15; i++) {
      try {
        const details = await contract.getProduct(i);
        if (details[0] === "") break;

        // FILTER: Only add to the list if the name is proper (more than 1 char)
        if (details[0].length > 1) {
          const history = await contract.getHistory(i);
          items.push({
            id: i,
            name: details[0],
            desc: details[1],
            owner: details[2].toLowerCase(),
            status: Number(details[3]),
            history: history
          });
        }
      } catch (e) { break; }
    }
    setAllProducts(items);
  };

  const registerProduct = async () => {
    try {
      setLoading(true);
      const tx = await contract.registerProduct(prodName, prodDesc);
      await tx.wait();
      alert(" Product Manufactured!");
      loadAllProducts();
    } catch (err) { alert("Error: Access Denied"); }
    finally { setLoading(false); }
  };

  const handleTransfer = async (id, currentStatus) => {
    const sequence = {
      0: "0xfaf1c82482066877CF951AA98c546A10C650DcC7",
      1: "0x3C5240b18B0249b43c91bB8821014AFA9F05Eb42",
      2: "0x49b5Fb760101FaaDa8465dB6D18D5bA7F6726e61"
    };
    try {
      setLoading(true);
      const tx = await contract.transferOwnership(id, sequence[currentStatus], currentStatus + 1, {
      gasLimit: 300000,
      maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"), // Higher tip for the miner
      maxFeePerGas: ethers.parseUnits("50", "gwei")        // Higher total cap
    });
      await tx.wait();
      alert(" Moved to next role!");
      loadAllProducts();
    } catch (err) { alert(" You are not the current owner!"); }
    finally { setLoading(false); }
  };

  const getRoleLabel = () => {
    if (!account) return "Not Connected";
    if (account === MANU_ADDR) return "🛠️ Manufacturer";
    if (account === "0xfaf1c82482066877CF951AA98c546A10C650DcC7".toLowerCase()) return " Distributor";
    if (account === "0x3C5240b18B0249b43c91bB8821014AFA9F05Eb42".toLowerCase()) return " Retailer";
    if (account === "0x49b5Fb760101FaaDa8465dB6D18D5bA7F6726e61".toLowerCase()) return " Consumer";
    return "👤 Supply Chain Partner";
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}> Syeda Zainab - Supply Chain </h1>
        <div style={styles.walletBox}>
          <p><strong>Role:</strong> <span style={{color: '#db2777'}}>{getRoleLabel()}</span></p>
          <button style={styles.btn} onClick={connectWallet}>{account ? "Connected" : "Connect Wallet"}</button>
        </div>
      </header>

      {/* ONLY Manufacturer sees this */}
      {account === MANU_ADDR && (
        <div style={styles.card}>
          <h3> Manufacture New Item</h3>
          <input style={styles.input} placeholder="Name" onChange={e => setProdName(e.target.value)} />
          <input style={styles.input} placeholder="Description" onChange={e => setProdDesc(e.target.value)} />
          <button style={styles.btnPrimary} onClick={registerProduct}>Create Product</button>
        </div>
      )}

      {/* ALL Products Grid */}
      <h2 style={{textAlign: 'center', marginTop: '40px', fontFamily: 'cursive'}}>Product Inventory</h2>
       <div style={styles.grid}>
  {allProducts.map(p => (
    <div key={p.id} style={styles.productCard}>
      <div style={styles.statusBadge}>{["Manufactured", "In Transit", "Delivered", "Sold"][p.status]}</div>
      <h4 style={{color: '#4f46e5', margin: '10px 0'}}>📦 {p.name}</h4>
      <p style={{fontSize: '11px', color: '#666', minHeight: '30px'}}>{p.desc}</p>
      <p style={{fontSize: '12px', fontWeight: 'bold'}}>ID: {p.id}</p>
      
      {/* Shortened Owner Address */}
      <p style={{fontSize: '10px', background: '#f3f4f6', padding: '5px', borderRadius: '5px'}}>
        👤 {p.owner.substring(0, 6)}...{p.owner.substring(p.owner.length - 4)}
      </p>

      <button style={styles.viewBtn} onClick={() => setSelectedProduct(p)}>View History</button>
      
      {account === p.owner && p.status < 3 && (
        <button style={styles.btnAction} onClick={() => handleTransfer(p.id, p.status)}>
          Transfer to Next Role
        </button>
      )}
    </div>
  ))}
</div>

      {/* POP-UP MODAL (HISTORY) */}
      {selectedProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{fontFamily: 'cursive'}}>History of {selectedProduct.name}</h2>
            <p><i>{selectedProduct.desc}</i></p>
            <p><strong>Product ID:</strong> {selectedProduct.id}</p>
            <hr/>
            <div style={{textAlign: 'left'}}>
              {selectedProduct.history.map((h, i) => (
                <p key={i} style={{fontSize: '12px', borderBottom: '1px solid #eee', padding: '5px'}}>
                  <strong>Step {i+1}:</strong> {h}
                </p>
              ))}
            </div>
            <button style={styles.closeBtn} onClick={() => setSelectedProduct(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#fff0f6', minHeight: '100vh', padding: '40px', fontFamily: 'Arial' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#6366f1', fontSize: '2.5rem' },
  walletBox: { background: '#fff', padding: '15px', borderRadius: '15px', display: 'inline-block' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' },
  card: { background: '#fff', padding: '20px', borderRadius: '20px', maxWidth: '400px', margin: 'auto' },
  productCard: { background: '#fff', padding: '20px', borderRadius: '15px', width: '220px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative' },
  statusBadge: { position: 'absolute', top: '10px', right: '10px', background: '#fce7f3', color: '#be185d', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' },
  input: { width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  btnPrimary: { background: '#db2777', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  btnAction: { background: '#6366f1', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', width: '100%', marginTop: '10px', cursor: 'pointer' },
  viewBtn: { background: 'none', border: '1px solid #db2777', color: '#db2777', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginTop: '5px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '90%', textAlign: 'center' },
  closeBtn: { marginTop: '20px', background: '#db2777', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '10px', cursor: 'pointer' }
};

export default App;