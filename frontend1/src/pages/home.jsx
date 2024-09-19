import { useEffect, useRef, useState } from "react";
import axios from 'axios';
const Home = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#010B13');
    const [currentlw, setCurrentlw] = useState(4);
    const [isErasing, setIsErasing] = useState(false);
    const colors = ["#2A3439", "#FF004F", "#FF4F00", "#7FFFD4", "#00FFFF", "#0070FF", "#9683EC"];
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [currentAIres, setCurrentAires] = useState({});
    const [explainArr, setExplainArr] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const handleSubmit = async () => {
        if (!canvasRef.current) return;

        try {
            setIsGenerating(true);
            const blob = await new Promise((resolve) => {
                canvasRef.current.toBlob(resolve, 'image/png');
            });

            const formData = new FormData();
            formData.append('image', blob, 'canvas-image.png');

            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Image uploaded:', response.data.imageUrl);
            setCurrentAires(response.data.geminiResponse);
            setIsGenerating(false);

        } catch (error) {
            console.error('Error uploading image:', error.message);
            alert('An error occurred while uploading the image. Please try again.');
            setIsGenerating(false);
        }
    };
    //handle ai responses
    useEffect(() => {

        if (currentAIres) {
            console.log(currentAIres);


            if (currentAIres.hasQuestion) {
                currentAIres.answers.forEach(answer => {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.font = `${answer.fontSize}px Winkle-Regular`;
                    ctx.fillStyle = currentColor;
                    ctx.fillText(answer.answer, answer.coordinateX, answer.coordinateY);
                    if (answer.rectangle) {
                        ctx.fillStyle = currentColor;
                        ctx.fillRect(answer.rectangle[1], answer.rectangle[2], answer.rectangle[3], answer.rectangle[4]);
                    }
                    setExplainArr([...explainArr, answer.explaination])
                });
            }

        }
    }, [currentAIres])
    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Manage canvas size and draw on it
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - canvas.offsetTop;

            ctx.putImageData(imageData, 0, 0);
            ctx.lineCap = "round";
            ctx.lineWidth = currentlw;
        };

        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [currentlw]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            setIsDrawing(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (isErasing) {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        }
        ctx.lineWidth = currentlw;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsErasing(false);
    };

    const activateEraser = () => {
        setIsErasing(true);
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // Brush size increment/decrement handlers
    const decrementLw = () => {
        if (currentlw > 4) {
            setCurrentlw(currentlw - 3);
        }
    };

    const incrementLw = () => {
        if (currentlw < 100) {
            setCurrentlw(currentlw + 3);
        }
    };
    // When Ctrl + Space is pressed, it triggers handleSubmit

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === ' ') {
                event.preventDefault();
                handleSubmit();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSubmit]);

    return (
        <div>
            <div id="exps" className="h-full w-min absolute right-0 top-0 flex-col align-bottom flex  z-20" >
                <ol className=" p-5 h-max border-black border-2 rounded-md m-2 text-white text-20 font-bold ">AI explainations: </ol>
                {explainArr.map((exp, index) => (
                    <ol key={index} className=" p-5 h-max border-black border-2 rounded-md m-2 bg-purple-10 text-20 font-bold ">{index + 1}.  {exp}</ol>
                ))}
            </div>
            <div
                className="brush border z-1 border-black"
                style={{
                    position: "absolute",
                    top: mousePos.y,
                    left: mousePos.x,
                    backgroundColor: currentColor,
                    width: currentlw,
                    height: currentlw,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    transform: "translate(-50%, -50%)",
                    transition: "0ms"
                }}
            >
            </div>
            <div id="navbar" className="border-2 absolute top-0 left-0 z-20">

                <div onClick={clearCanvas} className="mb-2 bg-purple-100 rounded-10 w-max rounded-md p-2 box-border hover:bg-purple-300 z-20">
                    <img src="/trash.svg" alt="clear" className="w-max pointer-events-none z-20" />
                </div>
                <div onClick={activateEraser} className="mb-2 bg-purple-100 rounded-10 w-max rounded-md p-2 box-border hover:bg-purple-300 z-20">
                    <img src="/eraser.svg" alt="eraser" className="w-max pointer-events-none z-20" />
                </div>
                <div className="mb-2 bg-purple-100 rounded-10 w-max rounded-md p-2 box-border z-20">
                    {colors.map((color) => (
                        <div
                            key={color}
                            className="w-7 h-7 rounded-full cursor-pointer my-2 border-2 border-white hover:border-black z-20"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                setCurrentColor(color);
                                setIsErasing(false);
                            }}
                        >
                        </div>
                    ))}
                </div>

                <div onClick={incrementLw} className=" bg-purple-100 rounded-10 w-max rounded-md p-2 box-border mt-2 mb-1 hover:bg-purple-300 z-20">
                    <img src="/arrowdropup.svg" alt="increase brush size" className="w-max pointer-events-none z-20" />
                </div>

                <div className=" bg-purple-100 rounded-10 w-max rounded-md p-2 box-border mt-2 mb-1 hover:bg-purple-300 z-20">
                    <div className="text-center text-2xl px-2">{currentlw}</div>
                </div>

                <div onClick={decrementLw} className=" bg-purple-100 rounded-10 w-max rounded-md p-2 box-border mt-2 mb-1 hover:bg-purple-300 z-20">
                    <img src="/arrowdropdown.svg" alt="decrease brush size" className="w-max pointer-events-none z-20" />
                </div>

                <div onClick={handleDownload} className=" bg-purple-100 rounded-10 w-max rounded-md p-2 box-border mt-2 mb-1 hover:bg-purple-300 z-20">
                    <img src="/download.svg" alt="download" className="w-max pointer-events-none z-20" />
                </div>
                <div onClick={handleSubmit} className=" bg-green-100 rounded-10 w-max rounded-md p-2 box-border mt-2 mb-1 hover:bg-green-300 z-20">
                    {isGenerating ? (
                        <img src="/star.png" id="png" alt="download" className="w-max pointer-events-none z-20" />
                    ) : (
                        <img src="/play.svg"  alt="download" className="w-max  pointer-events-none z-20" />
                    )}
                </div>
            </div>

            <canvas
                ref={canvasRef}
                id="canvasmain"
                className="absolute top-0 right-0 w-full h-full"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
            ></canvas>
        </div>
    );
};

export default Home;
