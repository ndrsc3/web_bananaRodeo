declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

// Support for other style files
declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.sass' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.less' {
    const content: { [className: string]: string };
    export default content;
} 