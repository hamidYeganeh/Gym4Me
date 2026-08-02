import type { SVGProps } from "react";

/** Default payment mark used on TicketCard (Mastercard brand artwork from design). */
export function TicketCardPaymentMark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 31.5642 18.9176"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M15.7821 16.6581C14.1105 18.0671 11.9421 18.9176 9.57274 18.9176C4.28586 18.9176 0 14.6828 0 9.45882C0 4.23486 4.28586 0 9.57274 0C11.9421 0 14.1105 0.850586 15.7821 2.25959C17.4537 0.850586 19.622 0 21.9914 0C27.2783 0 31.5642 4.23486 31.5642 9.45882C31.5642 14.6828 27.2783 18.9176 21.9914 18.9176C19.622 18.9176 17.4537 18.0671 15.7821 16.6581Z"
        fill="#ED0006"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M15.7821 16.6581C17.8403 14.9231 19.1455 12.3416 19.1455 9.45882C19.1455 6.57606 17.8403 3.99451 15.7821 2.25958C17.4537 0.850584 19.622 0 21.9914 0C27.2783 0 31.5642 4.23486 31.5642 9.45882C31.5642 14.6828 27.2783 18.9176 21.9914 18.9176C19.622 18.9176 17.4537 18.0671 15.7821 16.6581Z"
        fill="#F9A000"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M15.7821 16.658C17.8404 14.9231 19.1455 12.3416 19.1455 9.45884C19.1455 6.5761 17.8404 3.99456 15.7821 2.25963C13.7239 3.99456 12.4188 6.5761 12.4188 9.45884C12.4188 12.3416 13.7239 14.9231 15.7821 16.658Z"
        fill="#FF5E00"
        fillRule="evenodd"
      />
    </svg>
  );
}
