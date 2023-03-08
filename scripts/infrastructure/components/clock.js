class Clock extends React.Component {
    constructor(props) { 
        this.time = new Date();
    }

    render() {
        return <p>{this.time}</p>;
    };
}

export default Clock;

