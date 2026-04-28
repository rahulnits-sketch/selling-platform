import { Toaster as Sonner } from "sonner";

export function Toaster(props) {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
}
