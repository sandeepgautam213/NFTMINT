"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFT from "./assets/abi/NFT.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import nft from "./assets/images/nft.jpg";
import NFT1 from "./components/nft";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [burnloading, setBurnloading] = useState(false);
  const [connect, setConnect] = useState("");
  const [nfts, setNfts] = useState([]);
  const [mintPrice, setMintPrice] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [burnPrice, setBurnPrice] = useState(0);



  const contractAddress = "0x47255dB42274817C817B8A55CFBF99365efe4eB5";

  useEffect(() => {
    setConnect(localStorage.getItem("address"));
  }, []);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    window.ethereum.on("accountsChanged", async () => {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        localStorage.setItem("address", address);
        setConnect(localStorage.getItem("address"));
      } catch (error) {
        const accounts = await provider.listAccounts();
        if (accounts.length == 0) {
          localStorage.removeItem("address");
          setConnect(false);
          toast("Account not connected!");
          return;
        }
        const errorMessage = error.message.split("(")[0];
        toast(errorMessage);
      }
    });
  }, []);

  useEffect(() => {
    const setContractVal = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, NFT, signer);
        //console.log(NFT.abi);
        
        //console.log(contract);
        setContract(contract);
        const mintPrice = await contract.mintPrice();
        setMintPrice(ethers.formatEther(Number(mintPrice).toString()));
        console.log(mintPrice);
        setBurnPrice(localStorage.getItem("burnPrice"));
       // setBurnPrice(burnPrice);

        const allNFTs = [];
        const totalNFTs = parseInt(
          await contract.balanceOf(await signer.getAddress())
        );
        for (let i = 0; i < totalNFTs; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(
            await signer.getAddress(),
            i
          );

          let tokenMetadatURI = await contract.tokenURI(tokenId);

          if (tokenMetadatURI.startsWith("ipfs://")) {
            tokenMetadatURI = `https://ipfs.io/ipfs/${
              tokenMetadatURI.split("ipfs://")[1]
              //console.log()
            }`;
          }

          const tokenMetadata = await fetch(tokenMetadatURI).then((response) =>
            response.json()
          );
          allNFTs.push(tokenMetadata);
        }
        setNfts(allNFTs);
       // const mintPrice = await contract.mintPrice();
       // setMintPrice(Number(mintPrice));
      } catch (error) {
        const errorMessage = error.message.split("(")[0];
        toast(errorMessage);
      }
    };

    setContractVal();
  }, [connect]);

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!connect) {
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          localStorage.setItem("address", address);

          const contract = new ethers.Contract(
            contractAddress,
            NFT.abi,
            signer
          );
          setContract(contract);
          setConnect(localStorage.getItem("address"));
        }
      }
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
  };

  const mintNFT = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const { chainId } = provider.getNetwork();

    if (chainId != 11155111) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0xAA36A7",
          },
        ],
      });
    }
    const tokenURI =
      "ipfs://bafkreid5vbbsi4yy3girvkozlkprqkzz3qobpwbiyaw4ethxy7voyvmg6y";

    setLoading(true);
    try {
      const mintPrice = await contract.mintPrice();
     // console.log("Mint Price:", mintPrice.toString());
     setMintPrice(ethers.formatEther(Number(mintPrice).toString()));
     const options = { value: Number(mintPrice).toString() };


      //console.log(mintPrice);
     // console.log(contract);
      const mint = await contract.mint(tokenURI, options);
      
      await mint.wait(Number(await contract.mintPrice()));
      toast("Mint Successful");
      setmintPrice()
    } catch (error) {
      console.log(error);
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
  };
  const burn = async () => {
    try {
      setBurnloading(true);
     // const mintPrice = await contract.mintPrice();
     // setMintPrice(ethers.formatEther(Number(mintPrice).toString()));

      const supply = await contract.totalSupply();
      console.log(supply);

      const n = Number(supply)-1;
      const burnPrice = (n*n)/8000;
      setBurnPrice(burnPrice);
      if (Number(supply) === 1) {
        setBurnPrice(0.0001);
      }
      localStorage.setItem(
        "burnPrice",
        Number(supply) === 1 ? "0.0001" : burnPrice.toString()
      );
      
    
      const burn = await contract.burn();
      await burn.wait();
      toast("Burn Successful");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setBurnloading(false)
  };
    
  

  return (
    <>
  <ToastContainer position="top-right" />
  <div>
    <nav className="flex justify-between items-center bg-blue-500 p-4">
      <h2 className="text-xl font-bold text-white">MINT NFT</h2>
      {connect ? (
        <p className="text-white">
          {`${localStorage.getItem("address").slice(0, 7)}...${localStorage.getItem("address").slice(-5)}`}
        </p>
      ) : (
        <button className="bg-white text-blue-500 px-4 py-2 rounded-md shadow-md hover:bg-blue-400 hover:text-white" onClick={connectWallet}>
          Connect
        </button>
      )}
    </nav>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center">
        <div className="w-64 h-64 border border-gray-300 rounded-lg overflow-hidden">
          <div className="h-full">
            <Image src={nft} alt="" className="object-cover w-full h-full" />
          </div>
        </div>
        {connect && (
          <>
          <button className="ml-4 bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-400 focus:outline-none" onClick={mintNFT}
           disabled={loading || burnloading}>
           {!loading && `Mint Price  = ${mintPrice} Eth`}
                  {loading && (
                    <div>
                      Minting <p className={styles.spinner}></p>
                    </div>
                  )}
          </button>
          { (
                  <button
                    disabled={burnloading || loading}
                    className="ml-4 bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-400 focus:outline-none"
                    onClick={burn}
                  >
                    {!burnloading && `Burn Price = ${burnPrice} Eth`}
                    {burnloading && (
                      <div>
                        Burning <p className={styles.spinner}></p>
                      </div>
                    )}
                  </button>
                )}


          
          

          </>
        )}
        
      </div>
     
    </div>
  </div>
</>

   
  );
}