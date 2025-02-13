import NFTDetails from "@/components/NFTDetails"

export default async function NFTPage({ params }: { params: { tokenId: string } }) {
  const { tokenId } = await params

  return <NFTDetails tokenId={tokenId} />
}
