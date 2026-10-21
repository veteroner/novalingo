import { App } from './App';
import { FirebaseConfigError } from './FirebaseConfigError';
import { firebaseInitError } from '@/services/firebase/app';

/** Bu modül ve Firebase bağımlılıkları yalnızca yaş ekranından sonra yüklenir. */
export default function BootstrapApp() {
  return firebaseInitError ? <FirebaseConfigError error={firebaseInitError} /> : <App />;
}
