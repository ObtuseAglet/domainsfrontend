import { useState, useEffect } from "react";
import React from "react";
import './styles/App.css';
//import twitterLogo from './assets/twitter-logo.svg';
import contractAbi from "./utils/contractAbi.json";
import * as ethers from "ethers";
import { networks } from './utils/networks';
//import 'image-js';
import avalanchelogo from './assets/logos/avalanchelogo.png';
import * as toast from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import { useMetaMask } from "metamask-react";
const tld = '.ape';
const CONTRACT_ADDRESS = '0x107a2Bd4807Af1DF416208713E1640Dc56270571'


const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	//const [mints, setMints] = useState([]); 
	// state data properties
	const [network, setNetwork] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [text, setText] = useState('');
	//const [selectedNetwork, setselectedNetwork] = React.useState('');
	//const Web3Provider = new ethers.providers.Web3Provider();
	toast.toast.configure();
	//metamask
	//	function useConnectedMetaMask() {
	//		const {
	//		  // typed as string - can not be null
	//		  account,
	//		  // typed as string - can not be null
	//		  chainId
	//		} = useConnectedMetaMask();

	//		return <div>Connected account {account} on chain ID {chainId}</div>
	//	  }




	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			const accounts = await window.ethers.getNetwork.chainId;

			console.log("Connected", accounts[0]);
			toast.toast.info("Connected!");
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
			toast.toast("Current Network:", network);
		}
	}


	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the AVAX testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0xa869' }], // Check networks.js for hexadecimal network ids
				});

			} catch (switchError) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (switchError.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0xa869',
									chainName: 'Avalanche FUJI C-Chain',
									rpcUrls: ['https://rpc.ankr.com/avalanche_fuji-c'],
									nativeCurrency: {
										name: "AVAX",
										symbol: "AVAX",
										decimals: 18
									},
									blockExplorerUrls: ["https://testnet.snowtrace.io/"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(switchError);
				toast.toast.error("Press F12 to see errors.");
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			toast.toast.warn('APES NEED METAMASK! https://metamask.io/download.html');
		}
	}


	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Welcome Ape. Apes strong together.', account);
			setCurrentAccount(account);
		} else {
			toast.toast.info('Connect your wallet Ape');
		}

		// This is the new part, we check the user's network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);

		// Reload the page when they change networks
		function handleChainChanged() {
			window.location.reload();
		}
		//toast.success('Connected to ' + networks[avalanche].name);
	};


	const mintDomain = async () => {
		//dont run if empty
		if (!domain) { return }
		//alert user if domain is too short
		if (domain.length < 3) {
			toast.toast.error('Domain must be at least 3 characters long', { theme: "colored", autoClose: 5000 });
			return;
		}

		const { ethereum } = window;
		const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
			const priceTier1 = await contract.priceTier1();
			const priceTier2 = await contract.priceTier2();
			const priceTier3 = await contract.priceTier3();
			//const priceC1 = parseInt(priceTier1, 16);
			
			const price1 = (priceTier1/10**18).toFixed(2);
			const price2 = (priceTier2/10**18).toFixed(2);
			const price3 = (priceTier3/10**18).toFixed(2);
			console.log (price1);
			//const price1 = priceC1.toString();
			//const price2 = priceC2.toString();
			//const price3 = priceC3.toString();

		
		const price = domain.length === 3 ? price1 : domain.length === 4 ? price2 : price3;
		const id = toast.toast.info("Minting domain", {theme: "colored"} );
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
						console.log("Going to pop wallet now to pay gas...")
				let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
				//wait for transaction to be mined
				const receipt = await tx.wait();
				if (Error.code === 4001) { 
					console.log(Error.message, Error.code);
					toast.toast.error("Transaction cancelled by user.", { theme: "colored", autoClose: 5000 });
				}
				//check if transaction was successful
				if (receipt.status === 1) {
					toast.toast.update(id, { render: "All is good", type: "success", isLoading: false, autoclose: 500 | true });
					toast.toast.success("Domain minted! Apes Strong!");
					toast.toast.success("Click here to see your tx!", { type: "link" , onClick: () => { window.open("https://testnet.snowtrace.io/tx/" + tx.hash) } });

					//set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();

					toast.toast.success("Record set! https://testnet.snowtrace.io/tx/" + tx.hash);
					
					

					// Call fetchMints after 2 seconds
					//setTimeout(() => {
						//fetchMints();
					//}, 2000);

					setRecord('');
					setDomain('');
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error) {
			if (error.code === 4001) { 
				console.log(error.message, error.code);
				toast.toast.error("Transaction cancelled by user.", { theme: "colored", autoClose: 5000 });
				toast.toast.update(id, { render: "Minting cancelled", type: "error", isLoading: false, });
			}
			if (error.code === -32603) { 
				console.log(error.message, error.code);
				toast.toast.error("Domain name already in use.", { theme: "colored", autoClose: 5000 });
				toast.toast.update(id, { render: "Minting cancelled", type: "error", isLoading: false, });
			}
			console.log(error);
			console.log(error.code);
		}
	}

//	const fetchMints = async () => {
//		try {
///			const { ethereum } = window;
//			if (ethereum) {
//				// You know all this
//				const provider = new ethers.providers.Web3Provider(ethereum);
//				const signer = provider.getSigner();
//				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

//				// Get all the domain names from our contract
//				const names = await contract.getAllNames();

				// For each name, get the record and the address
				//const mintRecords = await Promise.all(names.map(async (name) => {
				//	const mintRecord = await contract.records(name);
				//	const owner = await contract.domains(name);
				//	return {
				//		id: names.indexOf(name),
				//		name: name,
				//		record: mintRecord,
				//		owner: owner,
				//	};
				//}));
//
		//		console.log("MINTS FETCHED ", names);
	//			setMints(names);
	//		}
	//	} catch (error) {
	//		console.log(error);
	//	}
	//}
	const avalancheChainId = "0xa869";
	const currentNetwork = window.ethereum.chainId;
	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (currentNetwork === avalancheChainId) {
			//fetchMints();
		}
	}, [currentAccount, network]);

	const updateDomain = async () => {
		if (!record || !domain) { return }
		setLoading(true);
		const id2 = toast.toast.loading("Updating domain");
		console.log("Updating domain", domain, "with record", record);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				let tx = await contract.setRecord(domain, record, text);
				await tx.wait();
				toast.toast.update(id2, { render: "Apes Strong!", type: "success", isLoading: false });
				toast.toast.success("Record set https://testnet.snowtrace.io/tx/" + tx.hash);
				console.log("Record set https://testnet.snowtrace.io/tx/" + tx.hash);

				//fetchMints();
				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	}

	// Render Methods

	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif" alt="Ninja donut gif" />
			{/* Call the connectWallet function we just wrote when the button is clicked */}
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	)


	//form to enter domain name and data
	const renderInputForm = () => {
		const avalancheChainId = "0xa869";
		const currentNetwork = window.ethereum.chainId;
		if (currentNetwork !== avalancheChainId) {
			return (
				<div className="connect-wallet-container">
					<h2>Please switch to Avalanche Fuji Testnet</h2>
					{/* This button will call our switch network function */}
					<button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
				</div>
			);
		}

		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>
				<div className="second-row">
					<input
						type="text"
						value={record}
						placeholder="What is your Apes AVAX address?"
						onChange={e => setRecord(e.target.value)}
					/>
				</div>
				<div className="third-row">
					<input
						type="text"
						value={text}
						placeholder="What is your apes story?"
						onChange={e => setText(e.target.value)}
					/>
				</div>
				{/* If the editing variable is true, return the "Set record" and "Cancel" button */}
				{editing ? (
					<div className="button-container">
						{/* This will call the updateDomain function we just made */}
						<button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
							Set record
						</button>
						{/* This will let us get out of editing mode by setting editing to false */}
						<button className='cta-button mint-button' onClick={() => { setEditing(false) }}>
							Cancel
						</button>
					</div>
				) : (
					// If editing is not true, the mint button will be returned instead
					<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
						Mint
					</button>
				)}
			</div>
		);
	}

	//const renderMints = () => {
	//	if (currentAccount && mints.length > 0) {
	//		return (
	//			<div className="mint-container">
	//				<p className="subtitle"> Recently minted domains!</p>
	//				<div className="mint-list">
	//					{mints}
	//				</div>
	//			</div>);
	//	}
	//};

	// This will take us into edit mode and show us the edit buttons!
	//const editRecord = (name) => {
	//	console.log("Editing record for", name);
	//	setEditing(true);
	//	setDomain(name);
	//}

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">Ape Domains</p>
							<p className="subtitle">Become .ape</p>
						</div>
						{/* Display a logo and wallet connection status*/}
						<div className="right">
							<img alt="Network logo" className="logo" src={avalanchelogo} />
							{currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
						</div>
					</header>
				</div>

				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}
				
				
				<footer>

				</footer>


			</div>
		</div>
	);
};

export default App;