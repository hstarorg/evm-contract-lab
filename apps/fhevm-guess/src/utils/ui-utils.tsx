import { Loader } from 'lucide-react';
import { toast } from 'sonner';

export function toastTransaction(hash: string) {
  const url = `https://sepolia.etherscan.io/tx/${hash}`;
  return toast.info(`Transaction sent with hash: ${hash}`, {
    duration: 10_000, // 10 seconds
    icon: <Loader className="animate-spin" />,
    position: 'bottom-right',
    description: (
      <div>
        <a href={url} target="_blank" rel="noopener noreferer">
          View on etherscan
        </a>
      </div>
    ),
  });
}
