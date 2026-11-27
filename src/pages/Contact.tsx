import { useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { useToast } from "../components/Toast";
import ContactHero from "./Contact/components/ContactHero";
import ContactInfoList from "./Contact/components/ContactInfoList";
import ContactForm from "./Contact/components/ContactForm";

export default function Contact() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [form, setForm] = useState({
    nume: "",
    email: "",
    telefon: "",
    mesaj: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {});
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setStatus("sent");
      toast("Mesajul tău a fost trimis cu succes!", "success");
      setForm({ nume: "", email: "", telefon: "", mesaj: "" });
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        toast(err.message, "error");
      } else {
        const fallbackMsg = "Nu am putut trimite mesajul. Încearcă din nou.";
        setErrorMessage(fallbackMsg);
        toast(fallbackMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white text-[#0d2c5c] overflow-hidden min-h-screen">
      <ContactHero videoRef={videoRef} />
      <section className="relative bg-white py-16 md:py-24 px-5 md:px-10 z-10 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start pt-4">
          <ContactInfoList />
          <ContactForm
            form={form}
            loading={loading}
            status={status}
            errorMessage={errorMessage}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </div>
  );
}
