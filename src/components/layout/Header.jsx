import React from 'react';

const Header = ({ title }) => {
  return (
    <div className="mb-4 sm:mb-8 text-center sm:text-left">
      {title && (
        <div className="inline-block sm:block">
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase sm:normal-case">
            {title}
          </h1>
          <div className="h-1 w-8 sm:w-12 bg-emerald-500 rounded-full mt-2 sm:mt-4 mx-auto sm:ml-0" />
        </div>
      )}
    </div>
  );
};

export default Header;
