import React from 'react';

export const renderAvatar = (url, name, isGroup = false) => {
  const shapeClass = isGroup ? "rounded-lg" : "rounded-full";
  if (url) {
    return <img src={url} alt={name} className={`w-10 h-10 ${shapeClass} object-cover bg-gray-200`} />;
  }
  return (
    <div className={`w-10 h-10 ${shapeClass} bg-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
      {name ? name.charAt(0).toUpperCase() : (isGroup ? 'G' : '?')}
    </div>
  );
};