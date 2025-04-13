"use client";

import { X } from "lucide-react";

interface WhatsappNotificationProps {
    onClose: () => void;
}

export function WhatsappNotification({ onClose }: WhatsappNotificationProps) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto relative">
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-blue-500 hover:text-blue-700"
            >
                <X className="h-4 w-4" />
            </button>
            <p className="text-sm pr-5">
                Need professional help with your chapter 1 - 5?
                <a
                    href="https://api.whatsapp.com/send?phone=2349055605167&text=Hi%2C%20I%20need%20help%20writing%20my%20Chapter%201%20-%205"
                    className="font-medium underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Send Us A message here
                </a>
            </p>
        </div>
    );
}