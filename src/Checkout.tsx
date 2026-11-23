import { useState } from "react";

export type Status = "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
export type PaymentMode = "COD" | "PREPAID";

export interface Shipment {
  awb: string;
  customer: string;
  status: Status;
  paymentMode: PaymentMode;
}

interface Props {
  onPlaceOrder: (shipment: Shipment) => void;
  onGoTrack: (awb: string, fallback?: Shipment) => void;
}

interface PincodeResponse {
  Status: string;
  PostOffice: { District: string; State: string }[] | null;
}

const ITEM_PRICE = 1499;
const SHIPPING = 49;
const COD_FEE = 40;

export default function Checkout({ onPlaceOrder, onGoTrack }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinError, setPinError] = useState("");
  const [payment, setPayment] = useState<PaymentMode>("COD");
  const [error, setError] = useState("");
  const [placedShipment, setPlacedShipment] = useState<Shipment | null>(null);

  const total = ITEM_PRICE + SHIPPING + (payment === "COD" ? COD_FEE : 0);

  const handlePincode = async (value: string) => {
    const pin = value.replace(/\D/g, "").slice(0, 6);
    setPincode(pin);
    setCity("");
    setState("");
    setPinError("");
    if (pin.length !== 6) return;
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data: PincodeResponse[] = await response.json();
      const office = data[0]?.PostOffice?.[0];
      if (office) {
        setCity(office.District);
        setState(office.State);
      } else {
        setPinError("Invalid pincode");
      }
    } catch {
      setPinError("Could not verify pincode. Please try again.");
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return setError("Enter your name");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit phone number");
    if (!address.trim()) return setError("Enter your address");
    if (!city) return setError("Enter a valid 6-digit pincode");

    const shipment: Shipment = {
      awb: `SW${Math.floor(1000 + Math.random() * 9000)}`,
      customer: name.trim(),
      status: "PICKED_UP",
      paymentMode: payment,
    };
    onPlaceOrder(shipment);
    setPlacedShipment(shipment);
    setError("");
  };

  if (placedShipment) {
    return (
      <div className="checkout-card order-success">
        <span className="success-mark">✓</span>
        <span className="mini-label">ORDER CONFIRMED</span>
        <h2>Your parcel is in motion.</h2>
        <p>Your demo order has been placed successfully. Keep this tracking number handy.</p>
        <div className="awb-ticket"><span>TRACKING NUMBER</span><b>{placedShipment.awb}</b></div>
        <button className="primary-button full-button" onClick={() => onGoTrack(placedShipment.awb, placedShipment)}>
          Track this order <span>→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-card">
      <div className="checkout-layout">
        <div className="checkout-fields">
          <span className="mini-label">DELIVERY DETAILS</span>
          <h2>Where should we send it?</h2>
          <div className="checkout-form">
            <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
            <label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" /></label>
            <label className="wide-field">Delivery address<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="House no., street, area" /></label>
            <label>Pincode<input value={pincode} onChange={(event) => handlePincode(event.target.value)} placeholder="6-digit pincode" inputMode="numeric" /></label>
            <label>City<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Auto-filled" /></label>
            <label className="wide-field">State<input value={state} onChange={(event) => setState(event.target.value)} placeholder="Auto-filled" /></label>
          </div>
          {pinError && <p className="form-error">{pinError}</p>}
          <span className="mini-label payment-label">PAYMENT METHOD</span>
          <label className={`payment-option ${payment === "COD" ? "selected" : ""}`}>
            <input type="radio" checked={payment === "COD"} onChange={() => setPayment("COD")} />
            <span><b>Cash on delivery</b><small>Pay when your parcel arrives</small></span><strong>+₹40</strong>
          </label>
          <label className={`payment-option ${payment === "PREPAID" ? "selected" : ""}`}>
            <input type="radio" checked={payment === "PREPAID"} onChange={() => setPayment("PREPAID")} />
            <span><b>Prepaid</b><small>UPI / Card (demo selection)</small></span><strong>₹0</strong>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full-button" onClick={handleSubmit}>Place order <span>→</span></button>
        </div>
        <aside className="order-summary">
          <span className="mini-label">ORDER SUMMARY</span>
          <div className="product-row"><div className="product-thumb">◈</div><div><b>Wireless Earbuds</b><small>Everyday audio</small></div><strong>₹{ITEM_PRICE}</strong></div>
          <div className="summary-line"><span>Subtotal</span><b>₹{ITEM_PRICE}</b></div>
          <div className="summary-line"><span>Shipping</span><b>₹{SHIPPING}</b></div>
          {payment === "COD" && <div className="summary-line"><span>COD fee</span><b>₹{COD_FEE}</b></div>}
          <div className="summary-total"><span>Total</span><b>₹{total}</b></div>
          <p className="summary-note">This is a frontend demo. No real payment will be collected.</p>
        </aside>
      </div>
    </div>
  );
}
