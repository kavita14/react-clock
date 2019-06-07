import * as React from "react";
import * as ReactDOM from "react-dom";
import SyntaxHighlighter from "react-syntax-highlighter/prism";
import { ghcolors } from "react-syntax-highlighter/styles/prism";
import { CircleSlider } from "../src/circle-slider";

interface IState {
    value: number;
}

export class App extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);
        this.state = { value: 0 };
    }
    public handleChange = (value: any) => {
        this.setState({ value });
    };

    public handleChangeRange = (event: any) => {
        this.setState({
            value: event.target.valueAsNumber,
        });
    };



    public render() {
        const { value } = this.state;
        const codeString = `npm install --save react-circle-slider`;
        return (

                    <div className="slider">
                        <CircleSlider
                            value={value}
                            size={200}
                            min={0}
                            max={86400}
                            shadow={true}
                            knobColor="#ff5722"
                            onChange={this.handleChange}
                            showTooltip={true}
                            showPercentage={true}
                            progressColor="pink"
                        />

                    </div>
                    
        );
    }
}



ReactDOM.render(<App />, document.getElementById("root"));
