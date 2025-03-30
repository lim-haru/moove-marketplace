export async function getJsonFromIPFS(cid: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/ipfs/${cid}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error)
    throw error
  }
}
