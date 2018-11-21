class PassMate {
	constructor(container) {
		this.SAFE_UALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
		this.SAFE_LALPHA = 'abcdefghijkmnpqrstuvwxyz';
		this.SAFE_NUM = '23456789';
		this.SAFE_ALPHANUM = this.SAFE_UALPHA + this.SAFE_LALPHA + this.SAFE_NUM;
		this.SAFE_SYMBOL = '!?';

		this.REQUIRED_SETS = [
			new Set(this.SAFE_UALPHA),
			new Set(this.SAFE_LALPHA),
			new Set(this.SAFE_NUM),
		];

		this.PASSWORD_LENGTH = 8;
		this.MASTER_PASSWORD_LENGTH = 32;
		this.PAGES_PER_LETTER = 2;
		this.PASSWORDS_PER_PAGE = 5;
		this.VERSION = 0;

		// how much extra random data to generate, to handle set misses.
		this.OVERSAMPLE = 4;

		this.pages = [];
		this.passwords = new Map();

		this.addOverview(container);

		this.addPages(container, 26 * 2 + 4);
		this.addFrontPage(this.pages[1]);
		this.addInstructions1(this.pages[2]);
		this.addInstructions2(this.pages[3]);
		this.addPasswordPages(
			this.pages.slice(4, 4 + (26 * this.PAGES_PER_LETTER)),
			this.PAGES_PER_LETTER,
			this.PASSWORDS_PER_PAGE);

		this.generateMasterPassword();
		this.onRecoveryChange();
	}

	addOverview(container) {
		let overview = this.addElement('overview', container);

		this.addElement('h1', overview, 'PassMate');
		this.addElement('h2', overview, 'Your Personal Password Book');
		this.addElement('blurb', overview, 'This website generates unique, secure, random passwords locally on your computer every time you load it. It organizes those passwords into book form, printable at home, with space for a website address and username with each password. When asked to choose a password for a new account, the book\'s owner uses a fresh one from the book, reducing password reuse and thwarting credential stuffing attacks.');
		this.addElement('blurb', overview, 'Technologically savvy, security conscious people frequently make use of password manager to generate and store passwords. Unfortunately, password managers (especially password generators) are still somewhat complex to use, which creates friction and drives many people away. You probably have friends or family who use one or a few simple passwords across all sites. PassMate isn\'t perfect security, but it can help them significantly increase their account security.');

		this.addElement('h2', overview, 'Creating Your Own Book');
		this.addElement('blurb', overview, 'Who will this book belong to?');
		this.ownerIn = this.addElement('owner', overview);
		this.ownerIn.contentEditable = true;
		this.ownerIn.addEventListener('input', () => {
			this.ownerOut.innerText = this.ownerIn.innerText;
		});

		this.addElement('blurb', overview, 'You need a printer that supports printing two-sided for the book to make sense. Print with the following options: Paper size: Letter, Layout/Orientation: Landscape, Two-sided: Long edge (or just enabled). The book uses 14 sheets of paper and provides 260 unique passwords, organized into groups of 10 by first letter of website name.');
		let print = this.addElement('blurb', overview, 'You can print the book now by clicking here.');
		print.style.fontWeight = 'bold';
		print.style.cursor = 'pointer';
		print.addEventListener('click', () => {
			window.print();
		});
		this.addElement('blurb', overview, 'Once you\'ve printed the book, fold it in half along the line in the center, with the "PassMate: Personal Password Book" title page facing out. You can bind the book with a rubber band along the fold. There are instructions for use on page 2.');

		this.addElement('h2', overview, 'Reprinting Your Book');
		this.addElement('blurb', overview, 'A unique code has been generated for you below. It changes every time you refresh this website. If you\'d like to reprint an existing book, change the code below to the one printed on page 3 of your old book. The new book will contain all the same passwords as the old book. This is all done without the code or passwords ever leaving your computer.');
		this.recoveryIn = this.addElement('recovery', overview);
		this.recoveryIn.contentEditable = true;
		this.recoveryIn.addEventListener('input', () => {
			this.onRecoveryChange();
		});

		this.addElement('h2', overview, 'Questions? Suggestions?');

		let contact = this.addElement('blurb', overview, 'Contact ian@passmate.io');
		contact.style.cursor = 'pointer';
		contact.addEventListener('click', () => {
			document.location = 'mailto:ian@passmate.io';
		});

		let github = this.addElement('blurb', overview, 'Source code & issue tracking at GitHub');
		github.style.cursor = 'pointer';
		github.addEventListener('click', () => {
			document.location = 'https://github.com/flamingcowtv/passmate';
		});
	}

	addPages(container, numPages) {
		console.assert(numPages % 4 == 0);
		let numSheets = numPages / 4;
		for (let sheetNum = 0; sheetNum < numSheets; ++sheetNum) {
			let sideNum = sheetNum * 2;
			container.appendChild(this.buildSide(numPages - sideNum, sideNum + 1));
			++sideNum;
			container.appendChild(this.buildSide(sideNum + 1, numPages - sideNum));
		}
	}

	buildSide(pageNumL, pageNumR) {
		let side = document.createElement('side');
		side.appendChild(this.buildPage(pageNumL));
		side.appendChild(this.buildPage(pageNumR));
		return side;
	}

	buildPage(pageNum) {
		let page = document.createElement('page');
		this.addElement('pagenum', page, pageNum);
		this.pages[pageNum] = page;
		return page;
	}

	addFrontPage(container) {
		container.setAttribute('data-pagetype', 'front');
		this.addElement('h1', container, 'PassMate');
		this.addElement('h2', container, 'Personal Password Book');
		this.ownerOut = this.addElement('owner', container);
	}

	addInstructions1(container) {
		container.setAttribute('data-pagetype', 'instructions');

		this.addElement('h2', container, 'Welcome to PassMate');
		this.addElement('blurb', container, 'When hackers break into websites, they often steal the passwords of every user of the site. When you use similar passwords across websites, or simple passwords that are used by others, your security is only as good as the least secure website you use. Security experts consider this a greater threat than writing passwords down on paper.');
		this.addElement('blurb', container, 'PassMate makes it easier to use unique, strong passwords for each website. This book is generated just for you, with high-security passwords that are different for each person. The passwords are never sent to PassMate.');

		this.addElement('h2', container, 'Creating a new account');
		this.addElement('blurb', container, 'When a website asks you to choose a password, find the page in this book by the first letter of the website name, then choose the next unused password on the page. Write down the website name and username next to your new password. If the website requires symbols in the password, circle the ?! at the end of the password, and include them when you type it in.');
		this.addElement('blurb', container, 'Your web browser may offer to save the password when you type it in. It\'s fine to let it do that. Those passwords are stored securely, and making it easier to use secure passwords makes you more likely to use them everywhere.');
	}

	addInstructions2(container) {
		container.setAttribute('data-pagetype', 'instructions');

		this.addElement('h2', container, 'Logging in');
		this.addElement('blurb', container, 'If your web browser has remembered your secure password from before and offers to enter it for you, let it do so. If not, read on.');
		this.addElement('blurb', container, 'It\'s not possible for most people to memorize secure, unique passwords for every website they use. Use this book as a reference whenever you log into a website, finding the page by the website name\'s first letter.');
		this.addElement('blurb', container, 'If there\'s no entry for the website because you used a common password for your account, pick the next unused password from the page in this book, and use the website\'s password change function to switch to the new, secure password. Remember to write down the website name and username once the change is successful!');

		this.addElement('h2', container, 'Reprinting this book');
		this.addElement('blurb', container, 'Keep a copy of the recovery code below somewhere safe. If you ever lose this book, or if you\'d like to print a new copy with the same passwords, visit passmate.io and enter the recovery code.');
		this.recoveryOut = this.addElement('recovery', container);
	}

	addPasswordPages(pages, pagesPerLetter, passwordsPerPage) {
		for (let i = 0; i < pages.length; ++i) {
			let page = pages[i];
			let letter = String.fromCharCode('A'.charCodeAt(0) + (i / pagesPerLetter));
			this.addElement('letter', page, letter);
			for (let j = 0; j < passwordsPerPage; ++j) {
				let pwblock = this.addElement('passwordBlock', page);
				this.addElement('passwordLabel', pwblock, 'Password:').style.gridArea = 'passwordLabel';

				let password = this.addElement('password', pwblock);
				password.style.gridArea = 'password';
				this.passwords.set(
					letter + '-' + (i % pagesPerLetter).toString() + '-' + j.toString(),
					this.addElement('passwordAlphaNum', password));
				this.addElement('passwordSymbols', password, this.SAFE_SYMBOL);

				this.addElement('websiteLabel', pwblock, 'Website:').style.gridArea = 'websiteLabel';
				this.addElement('website', pwblock).style.gridArea = 'website';
				this.addElement('usernameLabel', pwblock, 'Username:').style.gridArea = 'usernameLabel';
				this.addElement('username', pwblock).style.gridArea = 'username';
			}
		}
	}

	generatePassword(numChars, src) {
		let ret = [];
		let srcIndex = 0;
		while (ret.length < numChars && srcIndex < src.length) {
			ret.push.apply(ret, this.intToSafeChar(src[srcIndex++]));
		}
		return ret.join('');
	}

	validatePassword(password) {
		if (password.length < this.PASSWORD_LENGTH) {
			return false;
		}

		for (let set of this.REQUIRED_SETS) {
			let found = false;
			for (let c of password) {
				if (set.has(c)) {
					found = true;
					break;
				}
			}
			if (!found) {
				return false;
			}
		}

		return true;
	}

	generateMasterPassword() {
		if (this.recoveryIn.innerText != '') {
			return;
		}
		let masterPassword = this.generatePassword(
			this.MASTER_PASSWORD_LENGTH,
			crypto.getRandomValues(new Uint8Array(this.MASTER_PASSWORD_LENGTH * this.OVERSAMPLE)));
		this.recoveryIn.innerText = this.SAFE_ALPHANUM.charAt(this.VERSION) + masterPassword;
	}

	onRecoveryChange() {
		let recovery = this.recoveryIn.innerText;
		if (recovery.charAt(0) == 'A') {
			this.recoveryOut.innerText = recovery;
			crypto.subtle.importKey(
				'raw',
				this.stringToArray(recovery.slice(1)),
				{name: 'HKDF'},
				false,
				['deriveBits'])
			.then((key) => {
				this.addDerivedPasswords(key);
			});
		} else {
			console.assert(false, 'Invalid recovery key version:', this.recovery.charAt(0));
		}
	}

	addDerivedPasswords(key) {
		for (let [info, container] of this.passwords) {
			this.addDerivedPassword(key, info, container);
		}
	}

	addDerivedPassword(key, info, container) {
		crypto.subtle.deriveBits(
			{
				name: 'HKDF',
				salt: new ArrayBuffer(),
				info: this.stringToArray(info),
				hash: {name: 'SHA-256'},
			},
			key,
			this.PASSWORD_LENGTH * this.OVERSAMPLE * 8 /* bits per byte */)
		.then((bits) => {
			let password = this.generatePassword(this.PASSWORD_LENGTH, new Uint8Array(bits));
			if (this.validatePassword(password)) {
				container.innerText = password;
			} else {
				// Keep trying until we get a valid password.
				this.addDerivedPassword(key, info + 'x', container);
			}
		});
	}

	intToSafeChar(i) {
		console.assert(this.SAFE_ALPHANUM.length < 0x3f);
		i %= 0x3f;
		if (i < this.SAFE_ALPHANUM.length) {
			return [this.SAFE_ALPHANUM[i]];
		} else {
			return [];
		}
	}

	stringToArray(str) {
		let arr = new Uint8Array(str.length);
		for (let i = 0; i < str.length; ++i) {
			arr[i] = str.charCodeAt(i);
		}
		return arr;
	}

	addElement(tagName, container, text) {
		let elem = document.createElement(tagName);
		if (text) {
			elem.innerText = text;
		}
		container.appendChild(elem);
		return elem;
	}
}

function onReady() {
	new PassMate(document.getElementsByTagName('body')[0]);
}

if (document.readyState === "loading") {
	document.addEventListener('DOMContentLoaded', onReady);
} else {
	onReady();
}
