export const explorers: { [key: number]: string } = {
  1: "https://etherscan.io/tx/",
  17000: "https://sepolia.etherscan.io/tx/",
  11155111: "https://holesky.etherscan.io/tx/",
}

export function getExplorerUrl(chainId: number): string {
  return explorers[chainId] || "https://etherscan.io/tx/"
}
