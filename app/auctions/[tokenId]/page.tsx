import NFTDetails from "@/components/NFTDetails"

type Params = Promise<{ tokenId: string }>

export default async function NFTPage(props: { params: Params }) {
  const { tokenId } = await props.params

  return <NFTDetails tokenId={BigInt(tokenId)} />
}
