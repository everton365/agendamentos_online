import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const phoneNumber = "5585991793971"; // coloque seu número com DDI
  const message = "Olá! Gostaria de falar com o suporte.";

  const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-1">
      {/* Texto acima do botão */}
      <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1 rounded-lg shadow">
        Falar com suporte
      </span>

      {/* Botão WhatsApp */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
      >
        <FaWhatsapp size={30} />
      </a>
    </div>
  );
}
