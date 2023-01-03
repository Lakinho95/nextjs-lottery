import { useWeb3Contract, useMoralis } from "react-moralis"
import { contractAddresses, abi } from "../constants"
import { useEffect, useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    
    const dispatch = useNotification()
    const chainId = parseInt(chainIdHex)
    console.log(chainId)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0]:null
    console.log(raffleAddress)

    const {runContractFunction: getEntranceFee} = useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"getEntranceFee",
        params:{}
    })

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })


    const {
        runContractFunction: enterRaffle,
        isFetching,
        isLoading
    } = useWeb3Contract({
        abi:abi,
        contractAddress:raffleAddress,
        functionName:"enterRaffle",
        msgValue:entranceFee,
        params:{}
    })

    async function updateUIValues() {
        const entranceFeeOnCall = (await getEntranceFee()).toString()
        const playerNumberOnCall = (await getPlayersNumber()).toString()
        const recentWinnerOnCall = (await getRecentWinner())
        setEntranceFee(entranceFeeOnCall)
        setNumberOfPlayers(playerNumberOnCall)
        setRecentWinner(recentWinnerOnCall)
    }
    

    useEffect(() => {
        if (isWeb3Enabled && raffleAddress) {
            updateUIValues()
        }
    },[isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type:"info",
            message:"Transaction Complete",
            title:"Transaction Notification",
            position:"topR",
            icon:"book"
        })
    }

    const handleSucces = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            {
                raffleAddress ? (
                    <>
                    <button onClick={async () => {
                        await enterRaffle({
                            onSuccess:handleSucces,
                            onError: (error) => console.log(error)
                        })
                    }} 
                    disabled={isFetching || isLoading}
                    >Enter Raffle</button>
                    <p>Entrance fee is {ethers.utils.formatUnits(entranceFee,"ether")}</p>
                    <p>Broj igraca: {numberOfPlayers}</p>
                    <p>Predjasnji pobednik : {recentWinner}</p>
                    </>
                ) : (
                    <div>No Raffle Detected</div>
                )
            }
            
        </div>
    )
}