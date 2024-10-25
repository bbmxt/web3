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

  // Function to convert wei to BNB with 3 decimals
  const toBNB = (wei) => (Number(wei) / 1e18).toFixed(3);

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


return (
  <div className="w-full min-h-screen bg-gray-100 flex flex-col items-center py-10">
    {/* Connect Button Section */}
    <div className="flex flex-col items-center mb-8">
      <ConnectButton />
    </div>

    {/* Main Content Wrapper */}
    <div className="w-full max-w-md space-y-8">
      
      {/* Sign Up Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Sign Up</h2>
        <input
          type="text"
          placeholder="Referrer Address"
          value={referrer}
          onChange={(e) => setReferrer(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSignUp}
          disabled={isSignUpLoading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-300"
        >
          {isSignUpLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
        {isSignUpSuccess && (
          <p className="text-green-600 mt-3 text-center">Successfully signed up!</p>
        )}
      </div>

      {/* Earnings Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Your Earnings</h2>
        <p className="text-gray-700">
          Total Earned: {earnings ? `${toBNB(earnings[0])} BNB` : 'Loading...'}
        </p>
        <p className="text-gray-700">
          Withdrawable: {earnings ? `${toBNB(earnings[1])} BNB` : 'Loading...'}
        </p>
        <button
          onClick={handleWithdraw}
          disabled={isWithdrawLoading || !earnings?.[1] || (earnings[1] === 0n)}
          className="w-full bg-green-600 text-white p-3 rounded-lg mt-4 hover:bg-green-700 disabled:bg-gray-400 transition duration-300"
        >
          {isWithdrawLoading ? 'Withdrawing...' : 'Withdraw'}
        </button>
        {isWithdrawSuccess && (
          <p className="text-green-600 mt-3 text-center">Successfully withdrawn!</p>
        )}
      </div>

      {/* User Status Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">User Status</h2>
        <p className="text-center text-gray-700">
          {loadingIsSignedUp ? 'Loading...' : (isSignedUp ? 'You are signed up!' : 'You are not signed up.')}
        </p>
      </div>

      {/* Contract Info Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Contract Info</h2>
        <p className="text-gray-700">
          Sign Up Fee: {loadingSignUpFee ? 'Loading...' : `${signUpFee ? toBNB(signUpFee) : '0'} BNB`}
        </p>
        <p className="text-gray-700">
          Total Users: {loadingTotalUsers ? 'Loading...' : (totalUsers !== undefined ? totalUsers.toString() : '0')}
        </p>
      </div>

      {/* Upline Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Your Upline</h2>
        <p className="text-gray-700 text-center">
          {loadingUpline ? 'Loading...' : (upline ? `${upline.substring(0, 6)}...${upline.substring(upline.length - 4)}` : 'N/A')}
        </p>
      </div>

      {/* Downline Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Your Downline</h2>
        {loadingDownline ? (
          <p className="text-center text-gray-700">Loading...</p>
        ) : (
          downline && downline.length ? (
            <ul className="space-y-2 text-gray-700">
              {downline.map((level, index) => (
                <li key={index} className="text-center">Level {index + 1}: {level.toString()}</li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-700">No downline data available.</p>
          )
        )}
      </div>
    </div>
  </div>
);
}
