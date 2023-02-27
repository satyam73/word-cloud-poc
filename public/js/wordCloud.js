const d3 = window.d3;
const cloud = d3.layout.cloud;
const wordCloudContainer = document.querySelector('.wordCloud');
console.log(wordCloudContainer)

const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

const words = [
  'abound', 'abundance', 'abundant',
  'accessable', 'accessible', 'acclaim',
  'acclaimed', 'acclamation', 'accolade',
  'accolades', 'accommodative', 'accomodative',
  'accomplish', 'accomplished', 'accomplishment',
  'accomplishments', 'accurate', 'accurately',
  'achievable', 'achievement', 'achievements',
  'achievible', 'acumen', 'adaptable',
  'adaptive', 'adequate', 'adjustable',
  'admirable', 'admirably', 'admiration',
  'admire', 'admirer', 'admiring',
  'admiringly', 'adorable', 'adore',
  'adored', 'adorer'
]
export default function generateWordCloud(words) {

  var layout = cloud()
    .size([500, 400])
    .words(words.map(function (d) {
      return { text: d, size: 10 + Math.random() * 37, color: colors[Math.floor(Math.random() * (colors.length))] };
    }))
    .padding(5)
    .rotate(function () { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function (d) { return d.size; })
    .on("end", draw);

  function draw(words) {
    d3.select('.wordCloud').append("svg")
      .attr("width", layout.size()[0])
      .attr("height", layout.size()[1])
      .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", function (d) { return d.size + "px"; })
      .style("fill", function (d) { return d.color })
      .style("font-family", "Impact")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function (d) { return d.text; });
  }

  // layout started
  layout.start();
}