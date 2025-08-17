import { useState } from "react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "kenendy@kinety.com",
    password: "Feb@1234",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call here
    console.log("Login attempt:", formData);
  };

  const handleSocialLogin = (provider) => {
    // TODO: Add social login API call here
    console.log("Social login:", provider);
  };

  return (
    <div className="p-8 w-full max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-inter">
          Welcome back
        </h1>
        <p className="text-gray-600 text-lg font-normal font-inter whitespace-nowrap">
          Enter your details to get sign in to your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-lg font-semibold text-gray-700 mb-3 font-inter"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-6 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors bg-white text-lg font-inter font-normal"
            placeholder="Enter your email"
          />
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-lg font-semibold text-gray-700 mb-3 font-inter"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-6 py-3 pr-16 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors bg-white text-lg font-inter font-normal"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Forgot Password - moved closer to password field */}
          <div className="text-left mt-2">
            <button
              type="button"
              className="text-primary hover:text-secondary text-base font-normal font-inter"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-6 rounded-2xl font-semibold hover:bg-secondary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 text-lg font-inter"
        >
          Continue
        </button>
      </form>

      {/* Separator */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-lg text-gray-500 font-inter font-normal">
          Or sign in with
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-lg font-medium text-gray-700 font-inter">
            Google
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("apple")}
          className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter"
        >
          <img src="/apple.png" alt="Apple" className="w-5 h-5" />
          <span className="text-lg font-medium text-gray-700 font-inter">
            Apple
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter"
        >
          <img src="/facebook.png" alt="Facebook" className="w-5 h-5" />
          <span className="text-lg font-medium text-gray-700 font-inter">
            Facebook
          </span>
        </button>
      </div>
    </div>
  );
}
