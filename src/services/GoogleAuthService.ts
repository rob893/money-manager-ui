export class GoogleAuthService {
  public get gapiLoaded(): boolean {
    return !!gapi;
  }

  public get gaepiAuth2Loaded(): boolean {
    return this.gapiLoaded && !!gapi.auth2;
  }
  public installClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      const apiUrl = 'https://apis.google.com/js/api.js';
      const script = document.createElement('script');
      script.src = apiUrl;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {};
    });
  }
}
