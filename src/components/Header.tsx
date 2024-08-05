import logo from "public/logo.svg"
export const Header = () => {
  return (
    <div className="fixed h-10 sm:h-12 backdrop-blur-sm flex items-around">
      {logo}
    </div>
  )
};