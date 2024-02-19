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
  const [connect, setConnect] = useState("");
  const [nfts, setNfts] = useState([]);

  const contractAddress = "0x1F3dF7625888587230220a369f2e64b42A8Dfd8D";

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
        const contract = new ethers.Contract(contractAddress, NFT.abi, signer);
        setContract(contract);

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
              tokenMetadatURI.split("ipfs://")[2]
              //console.log()
            }`;
          }

          const tokenMetadata = await fetch(tokenMetadatURI).then((response) =>
            response.json()
          );
          allNFTs.push(tokenMetadata);
        }
        setNfts(allNFTs);
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
      const options = { value: ethers.parseEther("0.001") };
      // const mints = await contract.walletMints(account);
      // if (parseInt(mints) > 0) {
      //   throw new Error("You have already minted the nft.");
      // }
      const mint = await contract.mint(tokenURI, options);
      await mint.wait();
      toast("Mint Successful");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
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
          <button className="ml-4 bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-400 focus:outline-none" onClick={mintNFT}>
            {!loading ? "Mint Your NFT" : <p className="spinner"></p>}
          </button>
        )}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {nfts.map((data, index) => (
          <NFT1 image={data.image} key={index} />
        ))}
      </div>
    </div>
  </div>
</>

   
  );
}