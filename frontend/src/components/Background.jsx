export default function Background() {
  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[400px] h-[400px] rounded-full top-[-10%] left-[-5%]"
          style={{
            background: 'radial-gradient(circle, rgba(173,198,255,0.08) 0%, transparent 80%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bottom-[-15%] right-[-5%]"
          style={{
            background: 'radial-gradient(circle, rgba(173,198,255,0.08) 0%, transparent 80%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(77,142,255,0.1) 0%, transparent 70%)',
          }}
        />
      </div>
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
    </>
  );
}
