"use client";

import { useState, useEffect } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

// Access contract address and ABI from environment variables
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const contractABI = JSON.parse(process.env.NEXT_PUBLIC_CONTRACT_ABI);

export default function Home() {
  const { address, isConnected } = useAccount();
  const [referrer, setReferrer] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Citire fee de înscriere din contract
  const { data: signUpFee } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'fee',
  });

  // Verificăm dacă utilizatorul este înscris
  const { data: isSignedUp } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'signedUp',
    args: [address],
    enabled: !!address,
  });

  // Citire câștiguri ale utilizatorului
  const { data: earnings } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'earnings',
    args: [address],
    enabled: !!address,
  });

  // Funcție pentru înscriere
  const { write: signUp, data: signUpData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'signUp',
  });

  // Funcție pentru retragere
  const { write: withdraw, data: withdrawData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'withdraw',
  });

  // Gestionăm statusul tranzacției de înscriere
  const { isLoading: isSignUpLoading, isSuccess: isSignUpSuccess } = useWaitForTransaction({
    hash: signUpData?.hash,
  });

  // Gestionăm statusul tranzacției de retragere
  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWaitForTransaction({
    hash: withdrawData?.hash,
  });

  // Validare simplă pentru adresă
  const isValidAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

  // Funcție apelată la înscriere
  const handleSignUp = () => {
    if (referrer && isValidAddress(referrer)) {
      signUp({ args: [referrer], value: signUpFee });
    } else {
      alert('Please enter a valid referrer address');
    }
  };

  // Funcție apelată la retragere
  const handleWithdraw = () => {
    withdraw();
  };

  if (!isMounted) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center">
        <ConnectButton />
      </div>

      {isConnected && (
      <div className="flex flex-col items-center justify-center h-screen space-y-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
              <input
                type="text"
                placeholder="Referrer Address"
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <button
                onClick={handleSignUp}
                disabled={isSignUpLoading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isSignUpLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
              {isSignUpSuccess && (
                <p className="text-green-500 mt-2">Successfully signed up!</p>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-semibold mb-4">Your Earnings</h2>
              <p>Total Earned: {earnings?.totalEarned?.toString() || '0'} BNB</p>
              <p>Withdrawable: {earnings?.withdrawable?.toString() || '0'} BNB</p>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawLoading || !earnings?.withdrawable?.gt(0)}
                className="w-full bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-600 disabled:bg-gray-400"
              >
                {isWithdrawLoading ? 'Withdrawing...' : 'Withdraw'}
              </button>
              {isWithdrawSuccess && (
                <p className="text-green-500 mt-2">Successfully withdrawn!</p>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
