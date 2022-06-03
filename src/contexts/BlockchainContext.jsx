import React from "react";
import { ethers } from "ethers";

export const BlockchainContext = React.createContext({
  currentAccount: null,
  provider: null
});

async function isRinkebyTestNet(){
  const networkId = await ethereum.request({
    method: "net_version",
  });

/*
 * 1. Ethereum mainnet
 * 3. ropsten
 * 4. rinkeby
 * 56. BSC mainnet
 * 97. BSC testnet
 * 43114. Avalanche mainnet
 */
  if( networkId !== 4 ){
    const NETWORK_ID = 4;
    window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NETWORK_ID.toString(16)}` }],
    });
    // Metamask 會跳出切換區塊鏈的要求
  }
}

const BlockchainContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [provider, setProvider] = React.useState(null);

  React.useEffect( () => {
    /*
     * 使用 window.ethereum 來透過 Matamask 來取得錢包地址
     * 參考資料: https://docs.metamask.io/guide/rpc-api.html
     * 並且將錢包地址設定在上方事先寫好的 currentAccount state
     * 加分項目1: 使用 window.ethereum 偵測換錢包地址事件，並且切換 currentAccount 值
     * 加分項目2: 使用 window.ethereum 偵測目前的鏈是否為 Rinkeby，如果不是，則透過 window.ethereum 跳出換鏈提示
     * 提示: Rinkeby chain ID 為 0x4
     */
    const updateCurrentAccounts = accounts => {
      const [ walletAccount ] = accounts;
      setCurrentAccount( walletAccount ); 
    }

    window.ethereum.request({ method: 'eth_requestAccounts' }).then( updateCurrentAccounts );
    window.ethereum.on("accountsChanged", updateCurrentAccounts);

    isRinkebyTestNet();

    return () => {
//    變更function name
//    window.ethereum.off('accountsChanged', updateCurrentAccounts);      
      window.ethereum.removeListener('accountsChanged', updateCurrentAccounts);
    }

  }, []);

  React.useEffect(() => {
    /*
     * 使用 ethers.js
     * 透過 Web3Provider 將 window.ethereum 做為參數建立一個新的 web3 provider
     * 並將這個新的 web3 provider 設定成 provider 的 state
     */
    const myProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider( myProvider );
  }, []);

  return (
    <BlockchainContext.Provider value={{ currentAccount, provider }}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContextProvider;
