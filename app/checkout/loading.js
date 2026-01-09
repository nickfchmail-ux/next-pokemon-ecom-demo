import CircularProgress from "@mui/material/CircularProgress";

export default function Loading() {
  return (
    <div className="backdrop-blur-md bg-transparent flex justify-center items-center min-h-screen">
      <CircularProgress className="place-items-center" />
    </div>
  );
}
