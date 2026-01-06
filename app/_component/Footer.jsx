function Footer() {
  return (
    <footer className="h-auto bg-gray-700 text-white ">
      <div
        className={` flex flex-col justify-between items-center max-w-[90%] mx-auto space-y-2 mt-3`}
      >
        <div className={`flex`}>
          Follow us:{' '}
          <a href="https://twitter.com" style={{ color: 'white', margin: '0 5px' }}>
            <img src="x-icon.png" alt="Twitter" width="30" />
          </a>
          <a href="https://instagram.com" style={{ color: 'white', margin: '0 5px' }}>
            <img src="instagram-icon.png" alt="Instagram" width="30" />
          </a>
          <a href="https://facebook.com" style={{ color: 'white', margin: '0 5px' }}>
            <img src="facebook-icon.png" alt="Facebook" width="30" />
          </a>
        </div>
        <p className={`font-extrabold`}>
          &copy; {new Date().getFullYear()} Poké 芒. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
