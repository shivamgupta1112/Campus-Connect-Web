import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InteractiveInput = ({
    label,
    type = "text",
    value,
    onChange,
    autoComplete,
    showToggle = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const inputType = showToggle && type === "password"
        ? (showPassword ? "text" : "password")
        : type;

    return (
        <div className="relative mb-6 group">
            <div className={`
                absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl pointer-events-none
            `} />

            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete={autoComplete}
                    placeholder=" "
                    className={`
                        peer w-full px-4 py-4 rounded-xl bg-slate-800/80 backdrop-blur-md
                        border transition-all duration-300 outline-none
                        text-white placeholder-transparent
                        ${isFocused ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-slate-700 hover:border-slate-600'}
                    `}
                    id={label}
                />

                <label
                    htmlFor={label}
                    className={`
                        absolute left-4 px-2 rounded-md transition-all duration-200 pointer-events-none
                        
                        /* Default State (Floating) */
                        -top-2.5 text-xs text-indigo-400 bg-slate-900 border border-slate-700 shadow-sm z-10

                        /* Placeholder Shown State (Resting) */
                        peer-placeholder-shown:top-4 
                        peer-placeholder-shown:text-base 
                        peer-placeholder-shown:text-slate-400 
                        peer-placeholder-shown:bg-transparent 
                        peer-placeholder-shown:border-transparent 
                        peer-placeholder-shown:shadow-none
                        peer-placeholder-shown:z-0

                        /* Focus State (Force Float) */
                        peer-focus:-top-2.5 
                        peer-focus:text-xs 
                        peer-focus:text-indigo-400 
                        peer-focus:bg-slate-900 
                        peer-focus:border-slate-700 
                        peer-focus:shadow-sm 
                        peer-focus:z-10
                    `}
                >
                    {label}
                </label>

                {showToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/5"
                    >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InteractiveInput;
