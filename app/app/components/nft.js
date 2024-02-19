import Link from "next/link";
import styles from "./nft.module.css";

const NFT = ({ image }) => {
  return (
    <div className={styles.showNft}>
      <Link href="">
        <img
          src={`https://${image.split("ipfs://")[1]}.ipfs.nftstorage.link`}
          alt="NFT"
        />
      </Link>
    </div>
  );
};

export default NFT;