// Backwards-compat shim; new code should use VideoEmbed.
import VideoEmbed from "./VideoEmbed";

type Props = { shareUrl: string; title?: string };

export default function LoomEmbed({ shareUrl, title }: Props) {
  return <VideoEmbed url={shareUrl} title={title} />;
}
