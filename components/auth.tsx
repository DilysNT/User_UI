"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plane, MapPin, Camera, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha"; // Now actively used

const ShowModal = ({
  setShowModal,
  setIsLogin,
  setShowAgencyForm,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAgencyForm: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
      <h3 className="text-lg font-bold mb-4 text-center">Chọn loại tài khoản</h3>
      <button
        className="w-full py-2 mb-3 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
        onClick={() => {
          setShowModal(false);
          setIsLogin(false); // Show customer registration form
        }}
      >
        Tạo tài khoản khách hàng
      </button>
      <button
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => {
          setShowModal(false);
          setShowAgencyForm(true); // Show agency registration form
        }}
      >
        Tạo tài khoản Doanh nghiệp
      </button>
      <button
        className="w-full mt-4 text-gray-500 hover:underline text-sm"
        onClick={() => setShowModal(false)}
      >
        Hủy
      </button>
    </div>
  </div>
);

const RegisterAgency = ({ onBack }: { onBack: () => void }) => {
  const [form, setForm] = useState({
    agencyName: "",
    agencyEmail: "",
    agencyPhone: "",
    agencyAddress: "",
    taxCode: "",
    businessLicense: "",
    website: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.agencyName) newErrors.agencyName = "Vui lòng nhập tên công ty";
    if (!form.agencyEmail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.agencyEmail))
      newErrors.agencyEmail = "Email không hợp lệ";
    if (!form.agencyPhone || !/^\d{9,12}$/.test(form.agencyPhone))
      newErrors.agencyPhone = "Số điện thoại không hợp lệ";
    if (!form.taxCode || !/^\d{10,13}$/.test(form.taxCode))
      newErrors.taxCode = "Mã số thuế phải là số (10-13 ký tự)";
    if (!form.businessLicense) newErrors.businessLicense = "Vui lòng nhập mã giấy phép kinh doanh";
    if (!captchaToken) newErrors.captcha = "Vui lòng xác nhận CAPTCHA";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");
    
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && captchaToken) {
      try {
        const payload = {
          name: form.agencyName,
          email: form.agencyEmail,
          phone: form.agencyPhone,
          address: form.agencyAddress,
          tax_code: form.taxCode,
          business_license: form.businessLicense,
          website: form.website,
          captchaToken: captchaToken,
        };

        console.log("Sending registration request with payload:", payload);

        const res = await fetch("http://localhost:5000/api/agencies/public-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Response:", data); // Debug the response
        console.log("Status:", res.status); // Debug status
        
        if (!res.ok) {
          const errorMessage = data.message || data.error || `Đăng ký thất bại (Mã lỗi: ${res.status})`;
          setSubmitError(errorMessage);
          console.error("Registration failed:", errorMessage);
          // Reset CAPTCHA if submission fails
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
            setCaptchaToken(null);
          }
        } else {
          setSubmitted(true);
          setSubmitError(""); // Clear any previous errors
        }
      } catch (err) {
        const errorMessage = "Lỗi kết nối máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.";
        setSubmitError(errorMessage);
        console.error("Network error:", err);
        // Reset CAPTCHA on network error
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setCaptchaToken(null);
        }
      }
    } else {
      // Show validation error if no CAPTCHA
      if (!captchaToken) {
        setSubmitError("Vui lòng hoàn thành xác thực CAPTCHA để tiếp tục.");
      }
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative">
          <button
            type="button"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => {
              setSubmitted(false);
              onBack();
              router.push('/');
            }}
            aria-label="Đóng"
          >
            ×
          </button>
          
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-green-700">Đăng ký thành công!</h2>
          <div className="space-y-3 text-gray-700">
            <p className="text-base leading-relaxed">
              Yêu cầu đăng ký doanh nghiệp của bạn đã được gửi thành công.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-800 mb-2">Các bước tiếp theo:</p>
              <ul className="text-blue-700 space-y-1 text-left">
                <li>• Admin sẽ xem xét hồ sơ trong vòng 24 giờ</li>
                <li>• Thông tin đăng nhập sẽ được gửi qua email</li>
                <li>• Kiểm tra cả hộp thư spam/junk mail</li>
              </ul>
            </div>
          </div>
          
          <button
            className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            onClick={() => {
              setSubmitted(false);
              onBack();
              router.push('/');
            }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <button
            type="button"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onBack}
            aria-label="Đóng"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold text-center text-gray-800 pr-8">
            Đăng ký tài khoản Doanh nghiệp
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Vui lòng điền đầy đủ thông tin để đăng ký tài khoản doanh nghiệp
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{submitError}</span>
              </div>
            </div>
          )}

          {/* Company Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Thông tin công ty
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Nhập tên công ty"
                name="agencyName"
                value={form.agencyName}
                onChange={handleChange}
                required
              />
              {errors.agencyName && <p className="text-xs text-red-500 mt-1">{errors.agencyName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="company@example.com"
                  name="agencyEmail"
                  value={form.agencyEmail}
                  onChange={handleChange}
                  required
                  type="email"
                />
                {errors.agencyEmail && <p className="text-xs text-red-500 mt-1">{errors.agencyEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="0123456789"
                  name="agencyPhone"
                  value={form.agencyPhone}
                  onChange={handleChange}
                  required
                  type="tel"
                />
                {errors.agencyPhone && <p className="text-xs text-red-500 mt-1">{errors.agencyPhone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ công ty <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Nhập địa chỉ công ty"
                name="agencyAddress"
                value={form.agencyAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Legal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Thông tin pháp lý
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã số thuế <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="1234567890"
                  name="taxCode"
                  value={form.taxCode}
                  onChange={handleChange}
                  required
                />
                {errors.taxCode && <p className="text-xs text-red-500 mt-1">{errors.taxCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giấy phép kinh doanh <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="Mã số giấy phép"
                  name="businessLicense"
                  value={form.businessLicense}
                  onChange={handleChange}
                  required
                />
                {errors.businessLicense && <p className="text-xs text-red-500 mt-1">{errors.businessLicense}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website công ty
              </label>
              <input
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="https://company-website.com (không bắt buộc)"
                name="website"
                value={form.website}
                onChange={handleChange}
                type="url"
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Xác thực bảo mật
            </h3>
            
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LfA63UrAAAAADbmLXm2n5IRvZ7bkFBAHhGbOjI1"
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>
            {errors.captcha && <p className="text-xs text-red-500 text-center mt-2">{errors.captcha}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              disabled={!captchaToken}
            >
              {!captchaToken ? "Vui lòng xác thực CAPTCHA" : "Đăng ký Doanh nghiệp"}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
              Sau khi đăng ký, tài khoản của bạn sẽ được Admin xem xét và phê duyệt. 
              Thông tin đăng nhập sẽ được gửi qua email trong vòng 24 giờ.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const TravelAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]); // 6 ô nhập
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotValue, setForgotValue] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [showForgotOtp, setShowForgotOtp] = useState(false);
  const [forgotOtpDigits, setForgotOtpDigits] = useState(["", "", "", "", "", ""]);
  const [forgotOtpError, setForgotOtpError] = useState("");
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordMsg, setNewPasswordMsg] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [renderCounter, setRenderCounter] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setRenderCounter(prev => prev + 1);
    console.log("🔄 Auth component render #", renderCounter + 1);
    console.log("Current state - showForgot:", showForgot, "showForgotOtp:", showForgotOtp);
  });

  useEffect(() => {
    console.log("🎯 State change detected:");
    console.log("showForgot:", showForgot);
    console.log("showForgotOtp:", showForgotOtp);
    console.log("showNewPassword:", showNewPassword);
  }, [showForgot, showForgotOtp, showNewPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setOtpError("");
    setOtpSuccess("");
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setRegisterError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.message || "Đăng ký thất bại.");
      } else {
        setRegisterSuccess("");
        setShowOtpForm(true);
        setRegisteredEmail(formData.email);
      }
    } catch (err) {
      setRegisterError("Lỗi kết nối máy chủ.");
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // chỉ cho nhập số
    const newOtpDigits = [...otpDigits];
    newOtpDigits[idx] = value;
    setOtpDigits(newOtpDigits);
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    // Nếu xóa thì focus về trước
    if (!value && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    const otpValue = otpDigits.join("");
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Xác thực OTP thất bại.");
      } else {
        setGlobalMessage({ type: 'success', text: "Xác thực thành công! Bạn có thể đăng nhập." });
        setShowOtpForm(false);
        setIsLogin(true);
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        setOtpDigits(["", "", "", "", "", ""]);
      }
    } catch (err) {
      setOtpError("Lỗi kết nối máy chủ.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");
    if (!loginData.email || !loginData.password) {
      setLoginError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.message || "Đăng nhập thất bại.");
      } else {
        setLoginSuccess("Đăng nhập thành công!");
        localStorage.setItem('user', JSON.stringify(data.user || { email: loginData.email }));
        localStorage.setItem('token', data.token || '');
        setTimeout(() => {
          window.location.href = '/'; // Chuyển về trang chủ sau khi đăng nhập
        }, 500);
      }
    } catch (err) {
      setLoginError("Lỗi kết nối máy chủ.");
    }
  };

  // Handle forgot password submit - Step 1: Request OTP
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg("");
    
    const email = forgotValue.trim();
    console.log("Raw forgotValue:", JSON.stringify(forgotValue));
    console.log("Trimmed email:", JSON.stringify(email));
    console.log("Email length:", email.length);
    
    if (!email) {
      setForgotMsg("Vui lòng nhập email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setForgotMsg("Định dạng email không hợp lệ");
      return;
    }

    const payload = { email };
    const requestBody = JSON.stringify(payload);
    console.log("=== FORGOT PASSWORD REQUEST DEBUG ===");
    console.log("Payload object:", payload);
    console.log("JSON body:", requestBody);
    console.log("Body length:", requestBody.length);
    console.log("Request headers:", { "Content-Type": "application/json" });
    
    // Test if it's exactly the same as PowerShell
    const powershellBody = '{"email":"tranthingoctuyen.3393@gmail.com"}';
    console.log("PowerShell body:", powershellBody);
    console.log("Our body:", requestBody);
    console.log("Bodies match:", requestBody === powershellBody.replace("tranthingoctuyen.3393@gmail.com", email));
    
    try {
      console.log("About to send fetch request...");
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody
      });

      console.log("=== RESPONSE DEBUG ===");
      console.log("Response status:", res.status);
      console.log("Response statusText:", res.statusText);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));
      
      let responseText;
      try {
        responseText = await res.text();
        console.log("Raw response text:", responseText);
      } catch (textError) {
        console.error("Failed to read response text:", textError);
        setForgotMsg("Lỗi đọc phản hồi từ máy chủ.");
        return;
      }
      
      let data;
      try {
        // Only try to parse if responseText is not empty
        if (responseText && responseText.trim() !== "") {
          data = JSON.parse(responseText);
          console.log("Parsed response data:", data);
        } else {
          console.log("Empty response, creating default data object");
          data = { message: "Phản hồi trống từ máy chủ" };
        }
      } catch (parseErr) {
        console.error("Failed to parse response as JSON:", parseErr);
        console.log("Response text that failed to parse:", responseText);
        // If parsing fails but we got a response, try to use the raw text
        if (responseText) {
          data = { message: responseText };
        } else {
          data = { message: "Không thể xử lý phản hồi từ máy chủ" };
        }
      }
      
      console.log("=== CHECKING SUCCESS CONDITIONS ===");
      console.log("res.ok:", res.ok);
      console.log("res.status:", res.status);
      console.log("data.message:", data.message);
      console.log("Message includes OTP:", data.message && data.message.includes("OTP"));
      
      // Handle 404 error specifically
      if (res.status === 404) {
        console.log("404 Error - endpoint not found");
        setForgotMsg("Chức năng quên mật khẩu hiện không khả dụng. Vui lòng thử lại sau.");
        return;
      }
      
      // Check for success more broadly
      const isSuccess = res.ok || 
                       res.status === 200 || 
                       (data && data.message && (
                         data.message.includes("OTP") || 
                         data.message.includes("gửi") ||
                         data.message.includes("đã được gửi") ||
                         data.message.toLowerCase().includes("sent")
                       ));
      
      console.log("Success check result:", isSuccess);
      
      if (isSuccess) {
        console.log("SUCCESS DETECTED! Setting up transition...");
        setForgotMsg("OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
        
        // Debug: log OTP if in development
        if (data && data.debug && data.debug.otp) {
          console.log("Debug OTP:", data.debug.otp);
        }
        
        // Force immediate transition
        console.log("FORCING immediate transition to OTP form...");
        setShowForgot(false);
        setShowForgotOtp(true);
        
        // Multiple backup attempts
        setTimeout(() => {
          console.log("Backup 1: Setting OTP form state");
          setShowForgot(false);
          setShowForgotOtp(true);
        }, 100);
        
        setTimeout(() => {
          console.log("Backup 2: Setting OTP form state");
          setShowForgot(false);
          setShowForgotOtp(true);
        }, 500);
        
        setTimeout(() => {
          console.log("Backup 3: Setting OTP form state");
          setShowForgot(false);
          setShowForgotOtp(true);
        }, 1000);
      } else {
        console.log("FAILED response:", res.status, data);
        setForgotMsg(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotMsg("Lỗi kết nối máy chủ.");
    }
  };

  // Handle OTP change for forgot password
  const handleForgotOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtpDigits = [...forgotOtpDigits];
    newOtpDigits[idx] = value;
    setForgotOtpDigits(newOtpDigits);
    if (value && idx < 5) {
      forgotOtpRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      forgotOtpRefs.current[idx - 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !forgotOtpDigits[idx] && idx > 0) {
      forgotOtpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      forgotOtpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      forgotOtpRefs.current[idx + 1]?.focus();
    }
  };

  // Handle forgot password OTP verification - Step 2
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotOtpError("");
    const otpValue = forgotOtpDigits.join("");
    if (!otpValue || otpValue.length !== 6) {
      setForgotOtpError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotValue, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotOtpError(data.message || "OTP không chính xác.");
      } else {
        // Move to new password step
        setForgotResetToken(data.resetToken);
        setShowForgotOtp(false);
        setShowNewPassword(true);
        setForgotOtpDigits(["", "", "", "", "", ""]);
      }
    } catch (err) {
      setForgotOtpError("Lỗi kết nối máy chủ.");
    }
  };

  // Handle new password submit - Step 3
  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordMsg("");
    if (!newPassword || !confirmNewPassword) {
      setNewPasswordMsg("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNewPasswordMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setNewPasswordMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resetToken: forgotResetToken, 
          password: newPassword,
          confirmPassword: confirmNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNewPasswordMsg("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.");
        // Reset all forgot password states and go back to login
        setTimeout(() => {
          setShowNewPassword(false);
          setShowForgot(false);
          setForgotValue("");
          setNewPassword("");
          setConfirmNewPassword("");
          setForgotResetToken("");
        }, 2000);
      } else {
        setNewPasswordMsg(data.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch {
      setNewPasswordMsg("Lỗi kết nối máy chủ.");
    }
  };

  // Handle reset password submit
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetPassword || !resetConfirm) {
      setResetMsg("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setResetMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: resetPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMsg("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.");
      } else {
        setResetMsg(data.message || "Token không hợp lệ hoặc đã hết hạn.");
      }
    } catch {
      setResetMsg("Lỗi kết nối máy chủ.");
    }
  };

  // Detect reset token in URL (for reset password page)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        setShowReset(true);
        setResetToken(token);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl md:max-w-5xl lg:max-w-6xl h-auto flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* Left Panel */}
        <div className="hidden md:flex w-full md:w-1/2 relative flex-col justify-center items-start px-4 sm:px-8 md:px-12 lg:px-16 py-4 md:py-8 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 text-white">
          <div className="absolute top-8 left-6 flex items-center z-10">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-2">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold">TRAVEL TOUR</span>
          </div>
          <div className="z-10 max-w-md">
            <h1 className="text-3xl font-bold mb-2 leading-tight">
              Khám Phá Những
              <br />
              <span className="text-teal-100">Điểm Đến Tuyệt Vời</span>
            </h1>
            <p className="text-base text-teal-100 mb-4 leading-relaxed">
              Bắt đầu những chuyến hành trình khó quên và tạo ra những kỷ niệm đẹp với các trải nghiệm du lịch được tuyển chọn khắp thế giới.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-white-200" />
                <span className="text-sm text-white-100">Khám phá hơn 500 điểm đến trên toàn thế giới</span>
              </div>
              <div className="flex items-center">
                <Camera className="w-5 h-5 mr-3 text-white-200" />
                <span className="text-sm text-white-100">Chụp ảnh du lịch chuyên nghiệp</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3 text-white-200" />
                <span className="text-sm text-white-100">Hướng dẫn viên địa phương giàu kinh nghiệm</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-96 h-96 opacity-30">
            <div className="relative w-full h-full">
              <div className="absolute top-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-sm"></div>
              <div className="absolute top-40 right-16 w-16 h-32 bg-white/15 transform rotate-45 rounded-lg"></div>
              <div className="absolute bottom-20 left-10 w-20 h-20 bg-white/10 transform rotate-12 rounded-lg"></div>
              <div className="absolute bottom-40 right-20 w-32 h-16 bg-white/20 rounded-full blur-md"></div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 md:px-8 py-8">
          {isHydrated && showReset ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Đặt lại mật khẩu</h2>
                <p className="text-gray-600 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              {resetMsg && <div className={`mb-4 text-center text-base font-semibold ${resetMsg.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{resetMsg}</div>}
              <form onSubmit={handleReset} className="space-y-5 flex flex-col items-center w-full max-w-xs">
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Mật khẩu mới"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Xác nhận mật khẩu mới"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  required
                />
                <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition">Đặt lại mật khẩu</button>
                <button 
                  type="button" 
                  className="w-full bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 transition mt-2"
                  onClick={() => setShowReset(false)}
                >
                  Trở về trang trước
                </button>
              </form>
            </div>
          ) : isHydrated && showForgot ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Quên mật khẩu?</h2>
                <p className="text-gray-600 text-sm">Nhập email để nhận mã OTP đặt lại mật khẩu.</p>
              </div>
                {forgotMsg && <div className={`mb-4 text-center text-base font-semibold ${forgotMsg.includes('OTP đã được gửi') ? 'text-green-600' : 'text-red-500'}`}>
                {forgotMsg}
                {forgotMsg.includes('OTP đã được gửi') && (
                  <div className="mt-3 space-y-2">
                    <button 
                      type="button" 
                      className="block w-full bg-green-500 text-white py-2 px-4 rounded font-semibold hover:bg-green-600 transition"
                      onClick={() => {
                        console.log("MANUAL SWITCH: Forcing transition to OTP form");
                        console.log("Before switch - showForgot:", showForgot, "showForgotOtp:", showForgotOtp);
                        setShowForgot(false);
                        setShowForgotOtp(true);
                        setTimeout(() => {
                          console.log("After switch - showForgot:", showForgot, "showForgotOtp:", showForgotOtp);
                        }, 100);
                      }}
                    >
                      ➤ Chuyển đến trang nhập OTP
                    </button>
                    <div className="flex gap-2 justify-center">
                      <button 
                        type="button" 
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => {
                          console.log("=== DEBUG STATE ===");
                          console.log("showForgot:", showForgot);
                          console.log("showForgotOtp:", showForgotOtp);
                          console.log("forgotMsg:", forgotMsg);
                          console.log("isHydrated:", isHydrated);
                          console.log("forgotValue:", forgotValue);
                        }}
                      >
                        DEBUG STATE
                      </button>
                      <button 
                        type="button" 
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          try {
                            console.log("Testing direct API call...");
                            const testRes = await fetch("http://localhost:5000/api/auth/forgot-password", {
                              method: "POST",
                              headers: { 
                                "Content-Type": "application/json",
                                "Cache-Control": "no-cache",
                                "Pragma": "no-cache"
                              },
                              body: JSON.stringify({ email: "test@example.com" }),
                              cache: "no-store"
                            });
                            console.log("Direct test status:", testRes.status);
                            const testData = await testRes.text();
                            console.log("Direct test response:", testData);
                            alert(`Direct test: ${testRes.status} - ${testData}`);
                          } catch (e) {
                            console.error("Direct test error:", e);
                            alert(`Direct test error: ${e.message}`);
                          }
                        }}
                      >
                        TEST API
                      </button>
                    </div>
                  </div>
                )}
              </div>}
              <form onSubmit={handleForgot} className="space-y-5 flex flex-col items-center w-full max-w-xs">
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Nhập địa chỉ email"
                  value={forgotValue}
                  onChange={e => {
                    console.log("Email input change:", e.target.value);
                    setForgotValue(e.target.value);
                  }}
                  required
                />
                <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition">Gửi mã OTP</button>
                <button type="button" className="w-full mt-2 text-gray-500 hover:underline text-sm" onClick={() => setShowForgot(false)}>Quay lại đăng nhập</button>
                <button 
                  type="button" 
                  className="w-full bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 transition mt-2"
                  onClick={() => setShowForgot(false)}
                >
                  Trở về trang trước
                </button>
              </form>
            </div>
          ) : isHydrated && showForgotOtp ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Xác thực OTP</h2>
                <p className="text-gray-600 text-sm">Nhập mã OTP đã gửi về email <span className="font-semibold">{forgotValue}</span></p>
              </div>
              {forgotOtpError && <div className="text-red-500 text-sm text-center mb-2">{forgotOtpError}</div>}
              <form onSubmit={handleVerifyForgotOtp} className="space-y-5 flex flex-col items-center w-full">
                <div className="flex gap-3 justify-center mb-2">
                  {forgotOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { forgotOtpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-14 text-2xl text-center border border-gray-300 rounded focus:outline-teal-500 bg-white shadow-sm"
                      value={digit}
                      onChange={e => handleForgotOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleForgotOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-60 bg-teal-600 text-white py-3 rounded-lg text-base mt-2 text-lg font-semibold shadow hover:bg-teal-700 transition"
                >
                  Xác thực OTP
                </button>
                <button 
                  type="button" 
                  className="text-gray-500 hover:underline text-sm" 
                  onClick={() => {
                    setShowForgotOtp(false);
                    setShowForgot(true);
                    setForgotOtpDigits(["", "", "", "", "", ""]);
                    setForgotOtpError("");
                  }}
                >
                  Quay lại
                </button>
              </form>
            </div>
          ) : isHydrated && showNewPassword ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Đặt mật khẩu mới</h2>
                <p className="text-gray-600 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              {newPasswordMsg && <div className={`mb-4 text-center text-base font-semibold ${newPasswordMsg.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{newPasswordMsg}</div>}
              <form onSubmit={handleNewPassword} className="space-y-5 flex flex-col items-center w-full max-w-xs">
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  required
                />
                <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition">Đặt lại mật khẩu</button>
                <button 
                  type="button" 
                  className="w-full bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 transition mt-2"
                  onClick={() => {
                    setShowNewPassword(false);
                    setShowForgotOtp(true);
                  }}
                >
                  Trở về trang trước
                </button>
              </form>
            </div>
          ) : isHydrated && showAgencyForm ? (
            <RegisterAgency
              onBack={() => {
                setShowAgencyForm(false);
                setIsLogin(true);
              }}
            />
          ) : isHydrated && showOtpForm ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Xác thực OTP</h2>
                <p className="text-gray-600 text-sm">Nhập mã OTP đã gửi về email <span className="font-semibold">{registeredEmail}</span></p>
              </div>
              {otpError && <div className="text-red-500 text-sm text-center mb-2">{otpError}</div>}
              {otpSuccess && <div className="text-green-600 text-sm text-center mb-2">{otpSuccess}</div>}
              <form onSubmit={handleVerifyOtp} className="space-y-5 flex flex-col items-center w-full">
                <div className="flex gap-3 justify-center mb-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-14 text-2xl text-center border border-gray-300 rounded focus:outline-teal-500 bg-white shadow-sm"
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-60 bg-teal-600 text-white py-3 rounded-lg text-base mt-2 text-lg font-semibold shadow hover:bg-teal-700 transition"
                >
                  Xác thực
                </button>
                <button 
                  type="button" 
                  className="w-60 bg-gray-400 text-white py-2 rounded font-semibold hover:bg-gray-500 transition mt-2"
                  onClick={() => {
                    setShowOtpForm(false);
                    setIsLogin(false);
                    setOtpDigits(["", "", "", "", "", ""]);
                    setOtpError("");
                    setOtpSuccess("");
                  }}
                >
                  Trở về đăng ký
                </button>
              </form>
            </div>
          ) : isHydrated && !isLogin ? (
            // Customer Registration interface
            <div>
              <div className="flex justify-end mb-6">
                <button className="text-gray-500 text-xs flex items-center">
                  Tiếng Việt <span className="ml-1">▼</span>
                </button>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Tạo Tài Khoản</h2>
                <p className="text-gray-600 text-sm">Tham gia cùng chúng tôi để có những trải nghiệm du lịch tuyệt vời</p>
              </div>
              {registerError && <div className="text-red-500 text-sm text-center mb-2">{registerError}</div>}
              {registerSuccess && <div className="text-green-600 text-sm text-center mb-2">{registerSuccess}</div>}
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
                    </svg>
                  </span>
                  <input
                    placeholder="Tên đăng nhập"
                    className="w-full pl-10 pr-3 py-3 border-b border-gray-200 text-sm focus:outline-none"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="m22 5-10 7L2 5" />
                    </svg>
                  </span>
                  <input
                    placeholder="Địa chỉ email"
                    className="w-full pl-10 pr-3 py-3 border-b border-gray-200 text-sm focus:outline-none"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 26 24">
                      <rect width="18" height="11" x="3" y="7" rx="2" />
                      <path d="M7 7V4a5 5 0 0 1 10 0v3" />
                    </svg>
                  </span>
                  <input
                    placeholder="Mật khẩu"
                    className="w-full pl-10 pr-10 py-3 border-b border-gray-200 text-sm focus:outline-none"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1 1 0 0 1 0-.96A10.94 10.94 0 0 1 6.06 6.06M1 1l22 22" />
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect width="18" height="11" x="3" y="7" rx="2" />
                      <path d="M7 7V4a5 5 0 0 1 10 0v3" />
                    </svg>
                  </span>
                  <input
                    placeholder="Xác nhận mật khẩu"
                    className="w-full pl-10 pr-10 py-3 border-b border-gray-200 text-sm focus:outline-none"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1 1 0 0 1 0-.96A10.94 10.94 0 0 1 6.06 6.06M1 1l22 22" />
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-2 px-3 rounded-lg text-base mt-4"
                >
                  Tạo Tài Khoản
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="text-gray-600 text-xs">Đã có tài khoản? </span>
                <button
                  className="text-teal-600 hover:text-teal-800 font-medium text-xs"
                  onClick={() => {
                    setIsLogin(true);
                    setShowAgencyForm(false);
                  }}
                >
                  Đăng Nhập
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Khi tạo tài khoản, bạn phải đồng ý với{" "}
                  <a href="#" className="text-teal-600 hover:underline">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-teal-600 hover:underline">
                    Chính sách bảo mật
                  </a>{" "}
                  của chúng tôi.
                </p>
              </div>
            </div>
          ) : (
            // Login interface
            <div>
              {globalMessage && (
                <div className={`mb-4 text-center text-base font-semibold ${globalMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{globalMessage.text}</div>
              )}
              <div className="text-center mb-8 px-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng Nhập</h2>
                <p className="text-gray-600 text-sm">Chào mừng bạn quay trở lại!</p>
              </div>
              {loginError && <div className="text-red-500 text-sm text-center mb-2">{loginError}</div>}
              {loginSuccess && <div className="text-green-600 text-sm text-center mb-2">{loginSuccess}</div>}
              <form className="space-y-6 px-6 md:px-10" onSubmit={handleLogin}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
                    </svg>
                  </span>
                  <input
                    placeholder="Địa chỉ email"
                    className="w-full pl-10 pr-3 py-3 border-b border-gray-200 text-sm focus:outline-none"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <rect width="18" height="11" x="3" y="7" rx="2" />
                      <path d="M7 7V4a5 5 0 0 1 10 0v3" />
                    </svg>
                  </span>
                  <input
                    placeholder="Mật khẩu"
                    className="w-full pl-10 pr-10 py-3 border-b border-gray-200 text-sm focus:outline-none"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1 1 0 0 1 0-.96A10.94 10.94 0 0 1 6.06 6.06M1 1l22 22" />
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-teal-600 hover:underline" onClick={() => setShowForgot(true)}>
                    Quên mật khẩu?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-2 px-3 rounded-lg text-base mt-2"
                >
                  Đăng Nhập
                </button>
                <div className="text-center mt-3">
                  <span className="text-gray-600 text-xs">Chưa có tài khoản? </span>
                  <button
                    type="button"
                    className="text-teal-600 hover:underline font-medium text-sm"
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      {isHydrated && showModal && (
        <ShowModal
          setShowModal={setShowModal}
          setIsLogin={setIsLogin}
          setShowAgencyForm={setShowAgencyForm}
        />
      )}
    </div>
  );
};

export default TravelAuthPage;
