import * as React from "react";
import { CircleSliderHelper } from "./helpers/circle-slider-helper";
import { MouseHelper } from "./helpers/mouse-helper";
import { pathGenerator } from "./helpers/path-generator";

interface IProps {
    size?: number;
    circleWidth?: number;
    progressWidth?: number;
    knobRadius?: number;
    value?: number;
    stepSize?: number;
    min?: number;
    max?: number;
    circleColor?: string;
    progressColor?: string;
    gradientColorFrom?: string;
    gradientColorTo?: string;
    knobColor?: string;
    onChange: ((value?: number) => void);
    disabled?: boolean;
    shadow?: boolean;
    showTooltip?: boolean;
    showPercentage?: boolean;
    tooltipSize?: number;
    tooltipColor?: string;
}

interface IPoint {
    x: number;
    y: number;
}

interface IState {
    angle: number;
    currentStepValue: number;
    isMouseMove: boolean;
}

export class CircleSlider extends React.Component<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        circleColor: "#e9eaee",
        size: 180,
        value: 0,
        progressColor: "#007aff",
        knobColor: "#fff",
        circleWidth: 5,
        progressWidth: 20,
        knobRadius: 20,
        stepSize: 60,
        min: 0,
        max: 100,
        disabled: false,
        shadow: true,
        showTooltip: false,
        showPercentage: false,
        tooltipSize: 32,
        tooltipColor: "#333",
        onChange: () => ({}),
    };
    private maxLineWidth: number;
    private radius: number;
    private countSteps: number;
    private stepsArray: number[];
    private circleSliderHelper: CircleSliderHelper;
    private mouseHelper!: MouseHelper;
    private svg: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            angle: 0,
            currentStepValue: 0,
            isMouseMove: false,
        };
        const {
            min,
            max,
            stepSize,
            value,
            circleWidth,
            progressWidth,
            knobRadius,
        } = this.props;

        this.maxLineWidth = Math.max(circleWidth!, progressWidth!);
        this.radius =
            this.getCenter() - Math.max(this.maxLineWidth, knobRadius! * 2) / 2;
        this.countSteps = 1 + (max! - min!) / stepSize!;
        this.stepsArray = this.getStepsArray(min!, stepSize!);

        this.circleSliderHelper = new CircleSliderHelper(
            this.stepsArray,
            value,
        );
    }

    public componentDidMount() {
        this.mouseHelper = new MouseHelper(this.svg);
        this.setState({
            angle: this.circleSliderHelper.getAngle(),
            currentStepValue: this.circleSliderHelper.getCurrentStep(),
        });
    }

    public componentWillReceiveProps(nextProps: any) {
        if (this.props.value !== nextProps.value && !this.state.isMouseMove) {
            this.updateSliderFromProps(nextProps.value);
        }
    }

    public updateAngle = (angle: number): void => {
        this.circleSliderHelper.updateStepIndexFromAngle(angle);
        const currentStep = this.circleSliderHelper.getCurrentStep();
        this.setState({
            angle,
            currentStepValue: currentStep,
        });
        this.props.onChange(currentStep);
    };

    public updateSlider = (): void => {
        const angle = this.mouseHelper.getNewSliderAngle();
        if (Math.abs(angle - this.state.angle) < Math.PI) {
            this.updateAngle(angle);
        }
    };

    public updateSliderFromProps = (valueFromProps: number): void => {
        const { stepSize } = this.props;
        const newValue = Math.round(valueFromProps / stepSize!) * stepSize!;
        this.circleSliderHelper.updateStepIndexFromValue(newValue);
        this.setState({
            angle: this.circleSliderHelper.getAngle(),
            currentStepValue: newValue,
        });
    };

    public getCenter = (): number => {
        return this.props.size! / 2;
    };

    public getAngle = (): number => {
        return this.state.angle + Math.PI / 2;
    };

    public getPointPosition = (): IPoint => {
        const center = this.getCenter();
        const angle = this.getAngle();
        console.log("get angle in position===",angle)
        return {
            x: center + this.radius * Math.cos(angle),
            y: angle>2 ?  center + this.radius * Math.sin(angle): 16;
        };
    };

    public getStepsArray = (min: number, stepSize: number): number[] => {
        const stepArray = [];
        for (let i = 0; i < this.countSteps; i++) {
            stepArray.push(min + i * stepSize);
        }
        return stepArray;
    };

    public getPath = (): string => {
        const center = this.getCenter();
        const direction = this.getAngle() < 1.5 * Math.PI ? 0 : 1;
        const { x, y } = this.getPointPosition();
        const path = pathGenerator(center, this.radius, direction, x, y);
        return path;
    };

    public handleMouseMove = (event: Event): void => {
        event.preventDefault();
        this.setState({
            isMouseMove: true,
        });
        this.mouseHelper.setPosition(event);
        this.updateSlider();
    };

    public handleMouseUp = (event: Event): void => {
        event.preventDefault();
        this.setState({
            isMouseMove: false,
        });
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);
    };

    public handleMouseDown = (event: React.MouseEvent<SVGSVGElement>): void => {
        if (!this.props.disabled) {
            event.preventDefault();
            window.addEventListener("mousemove", this.handleMouseMove);
            window.addEventListener("mouseup", this.handleMouseUp);
        }
    };
    public handleTouchMove: any = (
        event: React.TouchEvent<SVGSVGElement>,
    ): void => {
        const targetTouches = event.targetTouches;
        const countTouches = targetTouches.length;
        const currentTouch: React.Touch = targetTouches.item(countTouches - 1)!;
        this.mouseHelper.setPosition(currentTouch);
        this.updateSlider();
    };

    public handleTouchUp = (): void => {
        window.removeEventListener("touchmove", this.handleTouchMove);
        window.removeEventListener("touchend", this.handleTouchUp);
    };

    public handleTouchStart = (): void => {
        if (!this.props.disabled) {
            window.addEventListener("touchmove", this.handleTouchMove);
            window.addEventListener("touchend", this.handleTouchUp);
        }
    };

    public render() {
        const {
            size,
            progressColor,
            gradientColorFrom,
            gradientColorTo,
            knobColor,
            circleColor,
            disabled,
            shadow,
            circleWidth,
            progressWidth,
            knobRadius,
            showTooltip,
            showPercentage,
            tooltipSize,
            tooltipColor,
        } = this.props;
        const { currentStepValue } = this.state;
        const offset = shadow ? "5px" : "0px";
        const { x, y } = this.getPointPosition();
        console.log("position x===",x);
        console.log("position y===",x);

        const center = this.getCenter();
        console.log("center y===",center);
        console.log("angle===",this.getAngle());
        const isAllGradientColorsAvailable =
            gradientColorFrom && gradientColorTo;
        return (<div>
            <svg
                ref={svg => (this.svg = svg)}

            >
                <g>
                    <circle
                        style={{
                            strokeWidth: circleWidth!,
                            stroke: "#1f2226",
                            fill: "none",
                        }}
                        r={this.radius}
                        cx={center}
                        cy={center}
                    />
                    <filter id="dropShadow" filterUnits="userSpaceOnUse">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="2" dy="2" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    <circle
                        style={{
                            fill: knobColor,
                            cursor: disabled ? "not-allowed" : "pointer",
                        }}
                        filter={shadow ? "url(#dropShadow)" : "none"}
                        r={knobRadius!}
                        cx={x}
                        cy={y}
                        onMouseDown={this.handleMouseDown}
                        onTouchStart={this.handleTouchStart}
                    />


        <text
                        x={size! / 2}
                        y={size! / 2 + tooltipSize! / 3}
                        textAnchor={"middle"}
                        fontSize={tooltipSize!}
                        fontFamily="Arial"
                        fill={tooltipColor}
                    >
                    {hhmmss(currentStepValue)}


                    </text>



                </g>

            </svg>

            <svg style={{marginLeft:"200px",marginTop:"100px"}}>
        <circle style={{
            strokeWidth: circleWidth!,
            stroke: "#1f2226",
            fill: "none",
        }} cx={0} cy={80} r={65} />
        <filter id="dropShadow" filterUnits="userSpaceOnUse">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="2" dy="2" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        <circle
            style={{
                fill: knobColor,
                cursor: disabled ? "not-allowed" : "pointer",
            }}
            filter={shadow ? "url(#dropShadow)" : "none"}
            r={knobRadius!}
            cx={x}
            cy={y}
            onMouseDown={this.handleMouseDown}
            onTouchStart={this.handleTouchStart}
        />
    </svg>

    <svg>
    <image xlinkHref="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvYAPF4pXGYWkX21mg80LBOYKEOy8EdDyTN1OLCYa_NrrvN5sp_Q" />
</svg>

</div>
        );
    }
}

function pad(num) {
    return ("0"+num).slice(-2);
}
function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs%60;
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return `${pad(hours)}:${pad(minutes)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}
