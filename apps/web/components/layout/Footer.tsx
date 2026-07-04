export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-gray-50">
      <div className="mx-auto flex max-w-7xl justify-between px-6 py-10">
        <div>
          <h2 className="text-2xl font-bold text-green-600">
            Quickify
          </h2>

          <p className="mt-3 text-gray-500">
            Delivering happiness in minutes.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">
            Quick Links
          </h3>

          <ul className="mt-3 space-y-2 text-gray-500">
            <li>About</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}