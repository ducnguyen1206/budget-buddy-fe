export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
      <div className="flex items-center space-x-3">
        <svg
          className="w-5 h-5 text-error"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.3a1 1 0 00-1.4 1.4L8.6 10l-1.3 1.3a1 1 0 101.4 1.4L10 11.4l1.3 1.3a1 1 0 001.4-1.4L11.4 10l1.3-1.3a1 1 0 00-1.4-1.4L10 8.6 8.7 7.3z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-error text-base font-medium font-inter">{message}</p>
      </div>
    </div>
  );
}
