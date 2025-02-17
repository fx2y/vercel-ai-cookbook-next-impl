declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENWEATHER_API_KEY: string;
    }
  }
}

export {}