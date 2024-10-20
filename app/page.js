"use client";

import { useState, useEffect } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const contractABI = JSON.parse(process.env.NEXT_PUBLIC_CONTRACT_ABI);

export default function Home() {
  const { address, isConnected } = useAccount();
  const [referrer, setReferrer] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to convert wei to BNB
  const toBNB = (wei) => (Number(wei) / 1e18).toFixed(18); // Convert wei to BNB

  // Contract read logic
  const { data: signUpFee, isLoading: loadingSignUpFee } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'fee',
  });

  const { data: totalUsers, isLoading: loadingTotalUsers } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'totalUsers',
  });

  const { data: isSignedUp, isLoading: loadingIsSignedUp } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'signedUp',
    args: [address],
    enabled: !!address,
  });

  const { data: earnings } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'earnings',
    args: [address],
    enabled: !!address,
  });

  // Upline and downline read logic
  const { data: upline, isLoading: loadingUpline } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'upline',
    args: [address],
    enabled: !!address,
  });

  const { data: downline, isLoading: loadingDownline } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'downline',
    args: [address],
    enabled: !!address,
  });

  const { write: signUp, data: signUpData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'signUp',
  });

  const { write: withdraw, data: withdrawData } = useContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'withdraw',
  });

  const { isLoading: isSignUpLoading, isSuccess: isSignUpSuccess } = useWaitForTransaction({
    hash: signUpData?.hash,
  });

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWaitForTransaction({
    hash: withdrawData?.hash,
  });

  const isValidAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleSignUp = () => {
    if (referrer && isValidAddress(referrer)) {
      signUp({ args: [referrer], value: signUpFee });
    } else {
      alert('Please enter a valid referrer address');
    }
  };

  const handleWithdraw = () => {
    withdraw();
  };

  if (!isMounted) return null;

console.log(contractABI);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center">
        <ConnectButton />
      </div>

      <div className="flex flex-col items-center justify-center">
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

        {/* Earnings Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Earnings</h2>
          <p>
            Total Earned: {earnings ? `${toBNB(earnings[0])} BNB` : 'Loading...'}
          </p>
          <p>
            Withdrawable: {earnings ? `${toBNB(earnings[1])} BNB` : 'Loading...'}
          </p>
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawLoading || !earnings?.[1] || (earnings[1] === 0n)}
            className="w-full bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-600 disabled:bg-gray-400"
          >
            {isWithdrawLoading ? 'Withdrawing...' : 'Withdraw'}
          </button>
          {isWithdrawSuccess && (
            <p className="text-green-500 mt-2">Successfully withdrawn!</p>
          )}
        </div>

        {/* User Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Status</h2>
          <p>
            {loadingIsSignedUp ? 'Loading...' : (isSignedUp ? 'You are signed up!' : 'You are not signed up.')}
          </p>
        </div>

        {/* Contract Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Contract Info</h2>
          <p>
            Sign Up Fee: {loadingSignUpFee ? 'Loading...' : `${signUpFee ? toBNB(signUpFee) : '0'} BNB`}
          </p>
          <p>
            Total Users: {loadingTotalUsers ? 'Loading...' : (totalUsers !== undefined ? totalUsers.toString() : '0')}
          </p>
        </div>

        {/* Upline Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Upline</h2>
          <p>{loadingUpline ? 'Loading...' : (upline || '0x0')}</p>
        </div>

        {/* Downline Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Downline</h2>
          {loadingDownline ? (
            <p>Loading...</p>
          ) : (
            downline && downline.length ? (
              <ul>
                {downline.map((level, index) => (
                  <li key={index}>Level {index + 1}: {level.toString()}</li>
                ))}
              </ul>
            ) : (
              <p>No downline data available.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
