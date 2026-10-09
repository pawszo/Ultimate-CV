import React, { useState, useRef } from "react";
import { PersonalDetails } from "../types";
import { User, Mail, Phone, Globe, Linkedin, MapPin, FileText, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  data: PersonalDetails;
  onChange: (data: PersonalDetails) => void;
}

export const PersonalDetailsForm: React.FC<Props> = ({ data, onChange }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Proszę wybrać plik będący obrazem (PNG, JPG, WEBP). / Please select an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert(t.photoTooBig);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange({
          ...data,
          photo: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      ...data,
      photo: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      <div className="flex items-center space-y-1 gap-3 border-b border-slate-50 pb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 font-display">{t.personalTitle}</h2>
          <p className="text-xs text-slate-400">{t.personalSubtitle}</p>
        </div>
      </div>

      {/* STREFA WGRYWANIA ZDJĘCIA (Drag and Drop i Kliknięcie) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-400" /> {t.photoLabel}
        </label>
        
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px] ${
            isDragging
              ? "border-blue-500 bg-blue-50/50"
              : data.photo
              ? "border-slate-200 bg-slate-50/20 hover:bg-slate-50/50"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          {data.photo ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                <img
                  src={data.photo}
                  alt="Profile Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left space-y-1 flex-1">
                <p className="text-xs font-semibold text-slate-700">{t.changePhoto}</p>
                <p className="text-[10px] text-slate-400">{t.photoHint}</p>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="mt-1 flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> {t.removePhoto}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1.5 py-2">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{t.uploadPhoto}</p>
                <p className="text-[10px] text-slate-400">{t.photoHint}</p>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">PNG, JPG, WEBP (&lt; 3 MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" /> {t.fullName}
          </label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="np. Jan Kowalski / John Doe"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {t.email}
          </label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="np. email@example.com"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.phone}
          </label>
          <input
            type="text"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="np. +48 501 234 567"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.location}
          </label>
          <input
            type="text"
            name="location"
            value={data.location}
            onChange={handleChange}
            placeholder="np. Kraków, Polska / London, UK"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> {t.website}
          </label>
          <input
            type="text"
            name="website"
            value={data.website}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Linkedin className="w-3.5 h-3.5 text-slate-400" /> {t.linkedin}
          </label>
          <input
            type="text"
            name="linkedin"
            value={data.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" /> {t.bio}
        </label>
        <textarea
          name="bio"
          value={data.bio}
          onChange={handleChange}
          rows={3}
          placeholder={t.bioPlaceholder}
          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
};
