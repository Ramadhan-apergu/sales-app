export default function FixedHeaderBar({ bgColor = "bg-white" }) {
    return (
      <div
        className={`h-12 fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[425px] z-50 ${bgColor}`}
      />
    );
  }
  