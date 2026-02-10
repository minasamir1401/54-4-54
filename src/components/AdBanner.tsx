
const AdBanner = () => {
    const adKey = 'ab1497b9fc6d24be92f1091c434e74d8';

    const adSrc = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background-color: transparent; height: 50px; }
            </style>
        </head>
        <body>
            <script type="text/javascript">
                atOptions = {
                    'key' : '${adKey}',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                };
            </script>
            <script type="text/javascript" src="https://offevasionrecruit.com/${adKey}/invoke.js"></script>
        </body>
        </html>
    `;

    return (
        <div className="flex justify-center items-center my-4 w-full min-h-[50px] mx-auto overflow-hidden rounded-lg bg-[#0e1217]/50 border border-white/5">
            <div className="scale-75 sm:scale-100 origin-center transition-transform">
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
        </div>
    );
};

export default AdBanner;
