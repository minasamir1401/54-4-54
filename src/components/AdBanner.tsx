

const AdBanner = () => {
    // Reverting to direct srcDoc as Blob URL might be too restrictive for some ad networks
    const adSrc = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background-color: transparent; }
            </style>
        </head>
        <body>
            <script type="text/javascript">
                atOptions = {
                    'key' : 'f358d99ed926924ac09e6b5a31c7d0f6',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                };
            </script>
            <script type="text/javascript" src="https://offevasionrecruit.com/f358d99ed926924ac09e6b5a31c7d0f6/invoke.js"></script>
        </body>
        </html>
    `;

    return (
        <div className="flex justify-center items-center my-4 w-full min-h-[50px] mx-auto overflow-hidden rounded-lg bg-[#0e1217]/50 border border-white/5">
            <iframe
                title="Ad Banner"
                width="320"
                height="50"
                scrolling="no"
                frameBorder="0"
                srcDoc={adSrc}
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-presentation"
                className="overflow-hidden"
            />
        </div>
    );
};

export default AdBanner;
