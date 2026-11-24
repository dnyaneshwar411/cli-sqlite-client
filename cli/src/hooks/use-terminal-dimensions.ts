import { useStdout } from "ink";
import { useEffect, useState } from "react";

export default function useTerminalDimensions() {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    columns: (stdout as any)?.columns || 80,
    rows: (stdout as any)?.rows || 24,
  });

  useEffect(() => {
    if (!stdout) return;
    const handleResize = () => {
      setSize({
        columns: (stdout as any).columns || 80,
        rows: (stdout as any).rows || 24,
      });
    };
    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  return size;
}
