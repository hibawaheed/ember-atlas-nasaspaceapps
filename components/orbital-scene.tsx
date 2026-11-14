/** Decorative orbital illustration, deliberately separate from scientific views. */
export default function OrbitalScene() {
  return (
    <div className="orbital-scene" aria-hidden="true">
      <svg viewBox="0 0 520 420" fill="none" focusable="false">
        <defs>
          <radialGradient id="orbital-halo">
            <stop stopColor="#6478ed" stopOpacity=".32" />
            <stop offset="1" stopColor="#6478ed" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orbital-planet" cx=".28" cy=".24" r=".82">
            <stop stopColor="#89bed7" />
            <stop offset=".23" stopColor="#416ca4" />
            <stop offset=".52" stopColor="#25365f" />
            <stop offset=".78" stopColor="#11172b" />
            <stop offset="1" stopColor="#050914" />
          </radialGradient>
          <linearGradient
            id="orbital-edge"
            x1="150"
            y1="110"
            x2="370"
            y2="310"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#b5efff" />
            <stop offset=".45" stopColor="#6e94dd" stopOpacity=".45" />
            <stop offset="1" stopColor="#293451" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="orbital-track"
            x1="38"
            y1="80"
            x2="480"
            y2="340"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#b9c7ff" stopOpacity=".08" />
            <stop offset=".55" stopColor="#9db3ff" stopOpacity=".65" />
            <stop offset="1" stopColor="#98aaff" stopOpacity=".12" />
          </linearGradient>
          <clipPath id="orbital-disc">
            <circle cx="268" cy="214" r="113" />
          </clipPath>
        </defs>
        <ellipse
          cx="268"
          cy="214"
          rx="245"
          ry="195"
          fill="url(#orbital-halo)"
        />
        <g stroke="#8195c4" strokeOpacity=".13">
          <circle cx="268" cy="214" r="156" />
          <circle cx="268" cy="214" r="184" strokeDasharray="2 9" />
          <path d="M268 11v25m0 356v17M62 214H39m435 0h25" />
        </g>
        <ellipse
          cx="268"
          cy="214"
          rx="227"
          ry="77"
          transform="rotate(-27 268 214)"
          stroke="url(#orbital-track)"
        />
        <circle
          cx="268"
          cy="214"
          r="114"
          fill="url(#orbital-planet)"
          stroke="url(#orbital-edge)"
          strokeWidth="2"
        />
        <g clipPath="url(#orbital-disc)" stroke="#b4daf5" strokeOpacity=".09">
          <ellipse
            cx="268"
            cy="214"
            rx="73"
            ry="113"
            transform="rotate(-20 268 214)"
          />
          <ellipse
            cx="268"
            cy="214"
            rx="29"
            ry="113"
            transform="rotate(-20 268 214)"
          />
          <ellipse
            cx="268"
            cy="214"
            rx="113"
            ry="35"
            transform="rotate(-20 268 214)"
          />
          <path d="M151 179c64 5 102-59 189-37M166 265c68 8 140-50 206-57" />
          <path
            d="m177 144 34-9 24 13-12 24 18 25-14 33-15-8-8-34-26-12Zm77-33 21 5 22 27 21 2 20 25-7 22-32-12-13-23-24-9Z"
            fill="#9fc4df"
            fillOpacity=".09"
            stroke="none"
          />
        </g>
        <path
          d="M66 306c32 29 147 7 261-52s192-128 170-161"
          stroke="url(#orbital-track)"
        />
        <g transform="translate(417 129) rotate(-27)">
          <path
            d="M-28-10h17v20h-17zm39 0h17v20H11Z"
            fill="#151f38"
            stroke="#9cb1ec"
          />
          <path
            d="M-22-10v20m6-20v20m32-20v20m6-20v20M-28 0h56"
            stroke="#9cb1ec"
            strokeOpacity=".5"
          />
          <rect x="-7" y="-14" width="14" height="28" rx="5" fill="#d7e1f7" />
          <circle r="3" fill="#ffb27f" />
        </g>
        <circle cx="114" cy="300" r="4" fill="#ffbc8d" />
        <circle cx="114" cy="300" r="9" stroke="#ffbc8d" strokeOpacity=".3" />
        <path
          d="M114 312v23h-44M423 111V76h42"
          stroke="#9eafd4"
          strokeOpacity=".3"
        />
        <g fill="#d3dcf3">
          <circle cx="83" cy="90" r="1.8" />
          <circle cx="449" cy="324" r="1.3" />
          <circle cx="335" cy="42" r="1.5" />
          <circle cx="170" cy="365" r="1" />
          <path
            d="M457 58v10m-5-5h10M86 229v8m-4-4h8"
            stroke="#d3dcf3"
            strokeOpacity=".6"
          />
        </g>
      </svg>
      <span className="orbital-caption">
        AN ORBITAL PERSPECTIVE <i /> ILLUSTRATION
      </span>
    </div>
  );
}
