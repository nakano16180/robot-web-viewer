import { LoaderUtils } from 'three';
import { XacroParser } from 'xacro-parser';
import URDFLoader from 'urdf-loader';


export class ModelLoader extends XacroParser {
  constructor() {
    super();
    this.fetchOptions = {
      headers: { Accept: "application/vnd.github.v3.raw" }
    };
    this.rospackCommands = {
      find( pkg ) {
        switch ( pkg ) {
          case 'curiosity_mars_rover_description':
            return 'https://raw.githubusercontent.com/gkjohnson/curiosity_mars_rover-mirror/master/curiosity_mars_rover_description/';
          default:
            return pkg;
        }
      }
    };
  }

  load(url, onComplete, onError) {
    const workingPath = LoaderUtils.extractUrlBase( url );
    console.log(workingPath);

    this
      .getFileContents(url)
      .then(text => {
        if (this.workingPath === '') {
          this.workingPath = workingPath;
        }
        this.parse(text, onComplete, onError);
      })
      .catch(e => {
        if (onError) {
          onError(e);
        }
      });
  }

  parse(data, onComplete, onError) {
    super
      .parse(data)
      .then(xml => {
        const urdfLoader = new URDFLoader();
        urdfLoader.packages = {
          'curiosity_mars_rover_description': 'https://raw.githubusercontent.com/gkjohnson/curiosity_mars_rover-mirror/master/curiosity_mars_rover_description/'
        };
        const robot = urdfLoader.parse( xml );
        onComplete(robot);
      })
      .catch(e => {
        if (onError) {
          onError(e);
        }
      });
  }

  getFileContents(path) {
    return fetch(path, this.fetchOptions)
      .then(res => {
        if (res.ok) {
          return res.text();
        } else {
          throw new Error(`XacroLoader: Failed to load url '${ path }' with error code ${ res.status } : ${ res.statusText }.`);
        }
      });
  }
}
